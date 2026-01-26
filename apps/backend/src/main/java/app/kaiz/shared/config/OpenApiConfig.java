package app.kaiz.shared.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI openAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Kaiz API")
                .description("Backend API for Kaiz - Run your life like a product team")
                .version("1.0.0")
                .contact(new Contact().name("Kaiz Team").email("support@kaiz.life"))
                .license(new License().name("Proprietary").url("https://kaiz.life/terms")))
        .servers(
            List.of(
                new Server().url("http://localhost:8080").description("Development"),
                new Server().url("https://api.kaiz.life").description("Production")))
        .components(
            new Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter your JWT token")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
  }
}
