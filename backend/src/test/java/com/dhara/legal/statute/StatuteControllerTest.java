package com.dhara.legal.statute;

import com.dhara.auth.JwtService;
import com.dhara.common.PagedResponse;
import com.dhara.common.ResourceNotFoundException;
import com.dhara.legal.statute.dto.StatuteListResponse;
import com.dhara.legal.statute.dto.StatuteResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = StatuteController.class)
@AutoConfigureMockMvc(addFilters = false)
class StatuteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StatuteService statuteService;

    @MockitoBean
    private JwtService jwtService; // required by the component-scanned JwtAuthFilter

    @Test
    void listStatutes_returnsPagedApiResponse() throws Exception {
        StatuteListResponse item = new StatuteListResponse(
                1L, "Act IX", "Contract Act", null, 1872, "civil", "ACTIVE");
        when(statuteService.findAll(0, 20))
                .thenReturn(new PagedResponse<>(List.of(item), 1, 0, 20));

        mockMvc.perform(get("/api/statutes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].titleEn").value("Contract Act"))
                .andExpect(jsonPath("$.data.items[0].year").value(1872))
                .andExpect(jsonPath("$.data.total").value(1));
    }

    @Test
    void getStatute_existingId_returnsStatute() throws Exception {
        StatuteResponse response = new StatuteResponse(
                1L, "Act IX", "Contract Act", null, 1872, "civil", "ACTIVE", null, null, null);
        when(statuteService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/statutes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.titleEn").value("Contract Act"));
    }

    @Test
    void getStatute_missingId_returns404WithError() throws Exception {
        when(statuteService.findById(99L)).thenThrow(new ResourceNotFoundException("Statute", 99L));

        mockMvc.perform(get("/api/statutes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Statute not found with id: 99"));
    }
}
