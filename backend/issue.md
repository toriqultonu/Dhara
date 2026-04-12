2026-04-06T00:24:48.314+06:00  WARN 9432 --- [           main] ConfigServletWebServerApplicationContext : Exception encountered during context initialization - cancelling refresh attempt: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Failed to initialize dependency 'flywayInitializer' of LoadTimeWeaverAware bean 'entityManagerFactory': Error creating bean with name 'flywayInitializer' defined in class path resource [org/springframework/boot/autoconfigure/flyway/FlywayAutoConfiguration$FlywayConfiguration.class]: Unable to obtain connection from database: FATAL: password authentication failed for user "toriqul"
---------------------------------------------------------------------------------------------------
SQL State  : 28P01
Error Code : 0
Message    : FATAL: password authentication failed for user "toriqul"

2026-04-06T00:24:48.315+06:00  INFO 9432 --- [           main] o.apache.catalina.core.StandardService   : Stopping service [Tomcat]
2026-04-06T00:24:48.321+06:00  INFO 9432 --- [           main] .s.b.a.l.ConditionEvaluationReportLogger :

Error starting ApplicationContext. To display the condition evaluation report re-run your application with 'debug' enabled.
2026-04-06T00:24:48.330+06:00 ERROR 9432 --- [           main] o.s.boot.SpringApplication               : Application run failed

org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Failed to initialize dependency 'flywayInitializer' of LoadTimeWeaverAware bean 'entityManagerFactory': Error creating bean with name 'flywayInitializer' defined in class path resource [org/springframework/boot/autoconfigure/flyway/FlywayAutoConfiguration$FlywayConfiguration.class]: Unable to obtain connection from database: FATAL: password authentication failed for user "toriqul"
---------------------------------------------------------------------------------------------------
SQL State  : 28P01
Error Code : 0
Message    : FATAL: password authentication failed for user "toriqul"

	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:325) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:204) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.context.support.AbstractApplicationContext.finishBeanFactoryInitialization(AbstractApplicationContext.java:970) ~[spring-context-6.2.1.jar:6.2.1]
	at org.springframework.context.support.AbstractApplicationContext.refresh(AbstractApplicationContext.java:627) ~[spring-context-6.2.1.jar:6.2.1]
	at org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext.refresh(ServletWebServerApplicationContext.java:146) ~[spring-boot-3.4.1.jar:3.4.1]
	at org.springframework.boot.SpringApplication.refresh(SpringApplication.java:752) ~[spring-boot-3.4.1.jar:3.4.1]
	at org.springframework.boot.SpringApplication.refreshContext(SpringApplication.java:439) ~[spring-boot-3.4.1.jar:3.4.1]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:318) ~[spring-boot-3.4.1.jar:3.4.1]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1361) ~[spring-boot-3.4.1.jar:3.4.1]
	at org.springframework.boot.SpringApplication.run(SpringApplication.java:1350) ~[spring-boot-3.4.1.jar:3.4.1]
	at com.dhara.DharaApplication.main(DharaApplication.java:10) ~[main/:na]
Caused by: org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'flywayInitializer' defined in class path resource [org/springframework/boot/autoconfigure/flyway/FlywayAutoConfiguration$FlywayConfiguration.class]: Unable to obtain connection from database: FATAL: password authentication failed for user "toriqul"
---------------------------------------------------------------------------------------------------
SQL State  : 28P01
Error Code : 0
Message    : FATAL: password authentication failed for user "toriqul"

	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1808) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.doCreateBean(AbstractAutowireCapableBeanFactory.java:601) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.createBean(AbstractAutowireCapableBeanFactory.java:523) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractBeanFactory.lambda$doGetBean$0(AbstractBeanFactory.java:336) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.DefaultSingletonBeanRegistry.getSingleton(DefaultSingletonBeanRegistry.java:289) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:334) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractBeanFactory.getBean(AbstractBeanFactory.java:199) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractBeanFactory.doGetBean(AbstractBeanFactory.java:312) ~[spring-beans-6.2.1.jar:6.2.1]
	... 10 common frames omitted
Caused by: org.flywaydb.core.internal.exception.FlywaySqlException: Unable to obtain connection from database: FATAL: password authentication failed for user "toriqul"
---------------------------------------------------------------------------------------------------
SQL State  : 28P01
Error Code : 0
Message    : FATAL: password authentication failed for user "toriqul"

	at org.flywaydb.core.internal.jdbc.JdbcUtils.openConnection(JdbcUtils.java:71) ~[flyway-core-10.20.1.jar:na]
	at org.flywaydb.core.internal.jdbc.JdbcConnectionFactory.<init>(JdbcConnectionFactory.java:76) ~[flyway-core-10.20.1.jar:na]
	at org.flywaydb.core.FlywayExecutor.execute(FlywayExecutor.java:137) ~[flyway-core-10.20.1.jar:na]
	at org.flywaydb.core.Flyway.migrate(Flyway.java:176) ~[flyway-core-10.20.1.jar:na]
	at org.springframework.boot.autoconfigure.flyway.FlywayMigrationInitializer.afterPropertiesSet(FlywayMigrationInitializer.java:66) ~[spring-boot-autoconfigure-3.4.1.jar:3.4.1]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.invokeInitMethods(AbstractAutowireCapableBeanFactory.java:1855) ~[spring-beans-6.2.1.jar:6.2.1]
	at org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory.initializeBean(AbstractAutowireCapableBeanFactory.java:1804) ~[spring-beans-6.2.1.jar:6.2.1]
	... 17 common frames omitted
Caused by: org.postgresql.util.PSQLException: FATAL: password authentication failed for user "toriqul"
at org.postgresql.core.v3.ConnectionFactoryImpl.doAuthentication(ConnectionFactoryImpl.java:711) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.core.v3.ConnectionFactoryImpl.tryConnect(ConnectionFactoryImpl.java:213) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl(ConnectionFactoryImpl.java:268) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.core.ConnectionFactory.openConnection(ConnectionFactory.java:54) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.jdbc.PgConnection.<init>(PgConnection.java:273) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.Driver.makeConnection(Driver.java:446) ~[postgresql-42.7.4.jar:42.7.4]
at org.postgresql.Driver.connect(Driver.java:298) ~[postgresql-42.7.4.jar:42.7.4]
at com.zaxxer.hikari.util.DriverDataSource.getConnection(DriverDataSource.java:137) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.pool.PoolBase.newConnection(PoolBase.java:360) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.pool.PoolBase.newPoolEntry(PoolBase.java:202) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.pool.HikariPool.createPoolEntry(HikariPool.java:461) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.pool.HikariPool.checkFailFast(HikariPool.java:550) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.pool.HikariPool.<init>(HikariPool.java:98) ~[HikariCP-5.1.0.jar:na]
at com.zaxxer.hikari.HikariDataSource.getConnection(HikariDataSource.java:111) ~[HikariCP-5.1.0.jar:na]
at org.flywaydb.core.internal.jdbc.JdbcUtils.openConnection(JdbcUtils.java:59) ~[flyway-core-10.20.1.jar:na]
... 23 common frames omitted

