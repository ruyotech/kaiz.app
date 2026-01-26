package app.kaiz;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.Architectures.layeredArchitecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "app.kaiz", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

  @ArchTest
  static final ArchRule domainShouldNotDependOnInfrastructure =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..infrastructure..");

  @ArchTest
  static final ArchRule domainShouldNotDependOnApplication =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..application..");

  @ArchTest
  static final ArchRule domainShouldNotDependOnApi =
      noClasses()
          .that()
          .resideInAPackage("..domain..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..api..");

  @ArchTest
  static final ArchRule applicationShouldNotDependOnApi =
      noClasses()
          .that()
          .resideInAPackage("..application..")
          .should()
          .dependOnClassesThat()
          .resideInAPackage("..api..");

  @ArchTest
  static final ArchRule controllersShouldResideInApiPackage =
      classes().that().haveSimpleNameEndingWith("Controller").should().resideInAPackage("..api..");

  @ArchTest
  static final ArchRule servicesShouldResideInApplicationPackage =
      classes()
          .that()
          .haveSimpleNameEndingWith("Service")
          .and()
          .areNotInterfaces()
          .should()
          .resideInAPackage("..application..");

  @ArchTest
  static final ArchRule repositoriesShouldResideInInfrastructurePackage =
      classes()
          .that()
          .haveSimpleNameEndingWith("Repository")
          .should()
          .resideInAPackage("..infrastructure..");

  @ArchTest
  static final ArchRule entitiesShouldResideInDomainPackage =
      classes()
          .that()
          .areAnnotatedWith(jakarta.persistence.Entity.class)
          .should()
          .resideInAPackage("..domain..");

  @ArchTest
  static final ArchRule hexagonalArchitecture =
      layeredArchitecture()
          .consideringAllDependencies()
          .layer("Api")
          .definedBy("..api..")
          .layer("Application")
          .definedBy("..application..")
          .layer("Domain")
          .definedBy("..domain..")
          .layer("Infrastructure")
          .definedBy("..infrastructure..")
          .layer("Shared")
          .definedBy("..shared..")
          .whereLayer("Api")
          .mayNotBeAccessedByAnyLayer()
          .whereLayer("Application")
          .mayOnlyBeAccessedByLayers("Api")
          .whereLayer("Domain")
          .mayOnlyBeAccessedByLayers("Api", "Application", "Infrastructure")
          .whereLayer("Infrastructure")
          .mayOnlyBeAccessedByLayers("Api", "Application")
          .whereLayer("Shared")
          .mayOnlyBeAccessedByLayers("Api", "Application", "Domain", "Infrastructure");
}
