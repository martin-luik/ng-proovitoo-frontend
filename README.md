# Events Management Frontend

A demo frontend application for managing events, built with **Angular 20.2.0** and **Node.js v24.7.0**.

---

## 🔗 Backend Dependency

This frontend requires the backend service to be running.  
You can find the backend source code here:  
👉 [ng-proovitoo-backend](https://github.com/martin-luik/ng-proovitoo-backend)

---

## 🚀 Prerequisites

- **Node.js** v24.7.0 or higher
- **npm** v10+ (bundled with Node.js)

---

## 📦 Installation

Install dependencies:

```bash
npm install
```

---

## 🛠️ Development

Start the local development server (default: [http://localhost:4200](http://localhost:4200)):

```bash
npm run start
```

---

## 🧪 Testing

### Unit Tests (Jasmine/Karma)

Run all unit tests:

```bash
npm run test
```

> Runs component and service unit tests.

---

### End-to-End Tests (Playwright)

- Run all e2e tests:

    ```bash
    npm run e2e
    ```

- Interactive UI mode (test explorer):

    ```bash
    npm run e2e:ui
    ```

- Run tests with a visible browser:

    ```bash
    npm run e2e:headed
    ```

- Generate new test code via recorder:

    ```bash
    npm run e2e:generate
    ```

---

## 📝 Notes

- Uses **ngx-translate** for i18n (currently only English translations).
- Authentication is **JWT-based**; a valid token must be present in `sessionStorage`.
- Some tests require the backend API running at [http://localhost:8080](http://localhost:8080).

