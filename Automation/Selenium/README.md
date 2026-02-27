# Selenium E2E Tests (Java + Maven)

Pruebas de extremo a extremo con Selenium WebDriver y JUnit 5. Los entornos y usuarios de prueba coinciden con Playwright y Cypress (development, qa, production).

---

## Requisitos

- **JDK 17+**
- **Maven** (o usar el wrapper `mvnw` si está en el proyecto)
- Aplicación Next.js en ejecución en el puerto correspondiente al entorno

---

## Comandos para ejecutar las pruebas

Ejecutar desde la carpeta **`Automation/Selenium`** (donde está el `pom.xml`).

### Ejecutar todos los tests

```bash
cd Automation/Selenium
mvn test
```

Por defecto se usa el entorno **development** (`http://localhost:3000`).

### Ejecutar con un entorno específico

```bash
mvn test -Dtest.env=development
mvn test -Dtest.env=qa
mvn test -Dtest.env=production
```

### Ejecutar solo una clase de test

```bash
mvn test -Dtest=LoginPageTest
mvn test -Dtest=LoginPageTest -Dtest.env=qa
```

### Ejecutar varias clases

```bash
mvn test -Dtest=LoginPageTest,OtraClaseTest
```

### Solo compilar (sin ejecutar tests)

```bash
mvn compile test-compile
```

---

## Estructura del proyecto

```
Automation/Selenium/
├── pom.xml
├── README.md
└── src/
    ├── main/java/com/kanbanAppSourceCode/   # (opcional)
    └── test/java/com/kanbanAppTests/
        ├── config/
        │   └── TestConfig.java       # Base URL y usuarios por entorno
        ├── pageobjects/
        │   └── LoginPage.java        # Page Object del login
        └── tests/
            └── LoginPageTest.java    # Tests de la página de login
```

---

## Referencia: System properties y `-D` (Maven/Java)

### ¿Qué es `-D`?

En Maven (y en la JVM), **`-Dnombre=valor`** define una **system property** (propiedad del sistema): un par clave–valor disponible para todo el proceso.

- Se pasan al arrancar la JVM (por ejemplo al ejecutar `mvn test`).
- Cualquier código puede leerlas con **`System.getProperty("nombre")`**.
- No son variables de entorno del SO; son propiedades de la JVM para esa ejecución.

En la práctica funcionan como **variables globales** de esa ejecución.

### ¿Qué es `-Dtest`?

**`-Dtest`** es una propiedad que usa el plugin **Surefire** de Maven para saber **qué clase(s) de test ejecutar**.

- **`mvn test`** → ejecuta todas las clases de test que Surefire encuentre.
- **`mvn test -Dtest=LoginPageTest`** → ejecuta solo la clase `LoginPageTest`.
- El nombre es convención de Surefire; no es una variable que tú definas en tu código.

### ¿`test` y `test.env` son lo mismo? ¿Hay algo “dentro” de `test` llamado `env`?

**No.** Son **dos propiedades distintas**. El punto no indica jerarquía.

- **`test`** → el nombre completo de la propiedad es la cadena **`"test"`**.
- **`test.env`** → el nombre completo de la propiedad es la cadena **`"test.env"`** (el punto es parte del nombre).

No existe “objeto test con un campo env”. Es un mapa plano de nombres (strings) y valores:

| Propiedad (nombre completo) | Uso / Ejemplo de valor   |
|----------------------------|---------------------------|
| `"test"`                   | Surefire: qué clase ejecutar (ej. `LoginPageTest`) |
| `"test.env"`               | Nuestro código: entorno (ej. `development`, `qa`, `production`) |

En `TestConfig.java` se lee con:

```java
System.getProperty("test.env", "development")
```

Si quisieras usar otro nombre (por ejemplo `test.ent` o `app.environment`), podrías; solo tendrías que usar **el mismo nombre** en `-D` y en `System.getProperty(...)`.

---

## Entornos

| Valor de `test.env` | Base URL              |
|--------------------|------------------------|
| `development`      | http://localhost:3000  |
| `qa` / `staging`   | http://localhost:3001  |
| `production` / `prod` | http://localhost:3002 |

Los usuarios de prueba por entorno están definidos en `TestConfig.java`.
