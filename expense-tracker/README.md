# Expense Tracker (Frontend)

Modern React + MUI dashboard for tracking **expenses**, **debts**, **budgets**, **analytics**, and exporting **PDF reports**.

## 1) Setup

1. Install dependencies:

```bash
npm install
```

2. Create an env file:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm start
```

## 2) Environment

Frontend reads the backend base URL from:

- `REACT_APP_API_URL`

Example is provided in `.env.example`.

## 3) Backend endpoints expected

- `POST /auth/login`
- `POST /auth/register`

- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`

- `GET /debts`
- `POST /debts`
- `PUT /debts/:id`
- `DELETE /debts/:id`
- `POST /debts/:id/payment`

## 4) Features

- Clean sidebar layout + topbar
- Dark/light toggle
- USD/LBP display conversion (backend remains USD)
- Budgets stored locally in browser
- Report page: export CSV + generate PDF (jsPDF)

