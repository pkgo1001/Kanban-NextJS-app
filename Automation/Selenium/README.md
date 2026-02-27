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

### Headless vs headed (ventana del navegador)

Por defecto los tests se ejecutan en **headless** (Chrome sin ventana visible). Para ver el navegador (**headed**), usa la propiedad `headless=false`.

| Modo | Comando |
|------|---------|
| **Headless** (sin ventana, por defecto) | `mvn test` o `mvn test -Dheadless=true` |
| **Headed** (ventana visible) | `mvn test -Dheadless=false` |

Combinado con entorno o una sola clase:

```bash
mvn test -Dheadless=false
mvn test -Dtest=LoginPageTest -Dheadless=false
mvn test -Dtest.env=qa -Dheadless=false
```

### Solo compilar (sin ejecutar tests)

```bash
mvn compile test-compile
```

### Reporte HTML (qué pasó / qué falló y en qué línea)

Cada vez que ejecutas **`mvn test`** se genera automáticamente un reporte HTML con:

- Qué tests pasaron y cuáles fallaron
- Mensaje de error y **stack trace** (archivo y **línea** donde falló)

**Dónde se guarda:** dentro de `src/test`, en una carpeta con fecha y hora del run, para que cada ejecución tenga su propio reporte:

```
Automation/Selenium/src/test/testResults/HTMLresults/ResultsFrom_<yyyy-MM-dd_HH-mm-ss>/surefire-report.html
```

Ejemplo: `src/test/testResults/HTMLresults/ResultsFrom_2025-02-23_14-30-00/surefire-report.html`

Al final de cada **`mvn test`** se imprime en consola la ruta y un enlace para abrir el reporte en el navegador (copia y pega la URL `file://...` en la barra de direcciones).

**Si hay tests fallidos:** el build no se detiene a propósito, para que siempre se genere el reporte y se muestre el enlace; así puedes abrir el HTML y ver qué falló y en qué línea. En consola seguirás viendo el resumen de fallos. Si en CI quieres que el build falle cuando hay tests fallidos, ejecuta: `mvn test -Dmaven.test.failure.ignore=false`.

---

## Por qué antes estaba en `target/site` y qué significan esos nombres

- **`target/`**: Es la convención de Maven para **toda la salida del build**: clases compiladas, JARs, reportes, etc. Por eso los reportes “oficiales” suelen generarse ahí. Se suele añadir a `.gitignore` porque es contenido generado.
- **`site/`**: Dentro de `target/`, Maven usa la carpeta **`site`** para el “site” del proyecto (lo que genera `mvn site`): documentación y reportes (Surefire, JaCoCo, etc.). El reporte de Surefire por defecto iba a `target/site/surefire-report.html` porque forma parte de ese “site”.

En este proyecto el reporte se genera en **`src/test/testResults/HTMLresults/ResultsFrom_<fecha-hora>`** para que:
1. Los resultados de pruebas queden junto al código de test (`src/test`).
2. Sea fácil de localizar (carpetas con nombres claros: resultados de pruebas, HTML, identificado por fecha/hora).
3. Cada ejecución tenga su propia carpeta y no se sobrescriba el reporte anterior.

---

## Estructura del proyecto

```
Automation/Selenium/
├── pom.xml
├── README.md
└── src/
    ├── main/java/com/kanbanAppSourceCode/   # (opcional)
    └── test/
        ├── testResults/                    # Reportes HTML (generados al correr mvn test)
        │   └── HTMLresults/
        │       └── ResultsFrom_<fecha-hora>/
        │           └── surefire-report.html
        └── java/com/kanbanAppTests/
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
| `"headless"`               | Nuestro código: si el navegador se abre headless (`true`) o headed (`false`). Por defecto `true`. |

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
