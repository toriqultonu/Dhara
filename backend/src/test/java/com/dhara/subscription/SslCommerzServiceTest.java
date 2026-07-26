package com.dhara.subscription;

import com.dhara.entity.SubscriptionPlan;
import com.dhara.entity.User;
import com.dhara.entity.UserSubscription;
import com.dhara.repository.SubscriptionPlanRepository;
import com.dhara.repository.UserRepository;
import com.dhara.repository.UserSubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class SslCommerzServiceTest {

    private static final String INIT_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
    private static final String VALIDATOR_URL =
            "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionPlanRepository planRepository;

    @Mock
    private UserSubscriptionRepository subscriptionRepository;

    private MockRestServiceServer server;
    private SslCommerzService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        service = new SslCommerzService(
                "teststore", "testpass", true, "http://localhost:8080",
                builder, userRepository, planRepository, subscriptionRepository);
    }

    private User user() {
        User u = new User();
        u.setId(1L);
        u.setName("Rahim Uddin");
        u.setEmail("rahim@example.com");
        return u;
    }

    private SubscriptionPlan plan(BigDecimal price) {
        SubscriptionPlan p = new SubscriptionPlan();
        p.setId(2L);
        p.setName("PROFESSIONAL");
        p.setPriceBdt(price);
        p.setDurationDays(30);
        return p;
    }

    // ── initPayment ────────────────────────────────────────────────────

    @Test
    void initPayment_gatewayAcceptsSession_returnsGatewayUrlAndPersistsPendingSubscription() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));
        when(planRepository.findById(2L)).thenReturn(Optional.of(plan(new BigDecimal("1500.00"))));
        server.expect(requestTo(INIT_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess(
                        "{\"status\":\"SUCCESS\",\"GatewayPageURL\":\"https://sandbox.sslcommerz.com/gw/pay123\"}",
                        MediaType.APPLICATION_JSON));

        String url = service.initPayment(1L, 2L, "BDT");

        assertThat(url).isEqualTo("https://sandbox.sslcommerz.com/gw/pay123");

        ArgumentCaptor<UserSubscription> captor = ArgumentCaptor.forClass(UserSubscription.class);
        verify(subscriptionRepository).save(captor.capture());
        UserSubscription pending = captor.getValue();
        assertThat(pending.getStatus()).isEqualTo("PENDING");
        assertThat(pending.getTransactionId()).startsWith("DHARA-");
        assertThat(pending.getPlan().getName()).isEqualTo("PROFESSIONAL");
        assertThat(pending.getUser().getEmail()).isEqualTo("rahim@example.com");
        server.verify();
    }

    @Test
    void initPayment_gatewayReturnsFailedStatus_throwsAndPersistsNothing() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));
        when(planRepository.findById(2L)).thenReturn(Optional.of(plan(new BigDecimal("1500.00"))));
        server.expect(requestTo(INIT_URL))
                .andRespond(withSuccess(
                        "{\"status\":\"FAILED\",\"failedreason\":\"Store Credential Error\"}",
                        MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> service.initPayment(1L, 2L, "BDT"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Store Credential Error");

        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void initPayment_gatewayUnreachable_throwsGatewayUnavailable() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));
        when(planRepository.findById(2L)).thenReturn(Optional.of(plan(new BigDecimal("1500.00"))));
        server.expect(requestTo(INIT_URL)).andRespond(withServerError());

        assertThatThrownBy(() -> service.initPayment(1L, 2L, "BDT"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("unavailable");

        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void initPayment_freePlan_throwsWithoutHttpCall() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));
        when(planRepository.findById(2L)).thenReturn(Optional.of(plan(BigDecimal.ZERO)));

        assertThatThrownBy(() -> service.initPayment(1L, 2L, "BDT"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not require payment");

        server.verify();
    }

    // ── validateAndActivate ────────────────────────────────────────────

    private UserSubscription pendingSubscription(String transactionId) {
        UserSubscription sub = new UserSubscription();
        sub.setUser(user());
        sub.setPlan(plan(new BigDecimal("1500.00")));
        sub.setStatus("PENDING");
        sub.setTransactionId(transactionId);
        return sub;
    }

    @Test
    void validateAndActivate_validatorConfirms_activatesPendingAndExpiresOldActive() {
        server.expect(requestTo(startsWith(VALIDATOR_URL)))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withSuccess(
                        "{\"status\":\"VALID\",\"tran_id\":\"TXN-1\",\"val_id\":\"V1\"}",
                        MediaType.APPLICATION_JSON));

        UserSubscription pending = pendingSubscription("TXN-1");
        UserSubscription oldActive = new UserSubscription();
        oldActive.setStatus("ACTIVE");

        when(subscriptionRepository.findByTransactionId("TXN-1")).thenReturn(Optional.of(pending));
        when(subscriptionRepository.findAllByUserIdAndStatus(1L, "ACTIVE"))
                .thenReturn(List.of(oldActive));

        boolean result = service.validateAndActivate(
                Map.of("tran_id", "TXN-1", "status", "VALID", "val_id", "V1"));

        assertThat(result).isTrue();
        assertThat(pending.getStatus()).isEqualTo("ACTIVE");
        assertThat(pending.getStartedAt()).isNotNull();
        assertThat(pending.getExpiresAt())
                .isAfter(Instant.now().plus(29, ChronoUnit.DAYS));
        assertThat(oldActive.getStatus()).isEqualTo("EXPIRED");
        verify(subscriptionRepository).save(pending);
    }

    @Test
    void validateAndActivate_validatorRejects_returnsFalseWithoutActivation() {
        server.expect(requestTo(startsWith(VALIDATOR_URL)))
                .andRespond(withSuccess("{\"status\":\"INVALID\"}", MediaType.APPLICATION_JSON));

        boolean result = service.validateAndActivate(
                Map.of("tran_id", "TXN-2", "status", "VALID", "val_id", "V2"));

        assertThat(result).isFalse();
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void validateAndActivate_transactionIdMismatch_returnsFalse() {
        server.expect(requestTo(startsWith(VALIDATOR_URL)))
                .andRespond(withSuccess(
                        "{\"status\":\"VALID\",\"tran_id\":\"OTHER-TXN\"}",
                        MediaType.APPLICATION_JSON));

        boolean result = service.validateAndActivate(
                Map.of("tran_id", "TXN-3", "status", "VALID", "val_id", "V3"));

        assertThat(result).isFalse();
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void validateAndActivate_alreadyActiveSubscription_isIdempotent() {
        server.expect(requestTo(startsWith(VALIDATOR_URL)))
                .andRespond(withSuccess(
                        "{\"status\":\"VALID\",\"tran_id\":\"TXN-4\"}",
                        MediaType.APPLICATION_JSON));

        UserSubscription active = pendingSubscription("TXN-4");
        active.setStatus("ACTIVE");
        when(subscriptionRepository.findByTransactionId("TXN-4")).thenReturn(Optional.of(active));

        boolean result = service.validateAndActivate(
                Map.of("tran_id", "TXN-4", "status", "VALID", "val_id", "V4"));

        assertThat(result).isTrue();
        verify(subscriptionRepository, never()).save(any());
        verify(subscriptionRepository, never()).findAllByUserIdAndStatus(any(), any());
    }

    @Test
    void validateAndActivate_callbackStatusNotValid_returnsFalseWithoutHttpCall() {
        boolean result = service.validateAndActivate(
                Map.of("tran_id", "TXN-5", "status", "FAILED", "val_id", "V5"));

        assertThat(result).isFalse();
        server.verify();
        verify(subscriptionRepository, never()).save(any());
    }

    @Test
    void validateAndActivate_missingValId_returnsFalse() {
        boolean result = service.validateAndActivate(Map.of("tran_id", "TXN-6", "status", "VALID"));

        assertThat(result).isFalse();
        server.verify();
    }
}
