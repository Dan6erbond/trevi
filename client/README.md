# Trevi Client

The frontend application for Trevi, built with **TanStack Start** and powered by **TanStack Query** for efficient data fetching and state management.

## 🛠️ Tech Stack

| Area          | Technologies                          |
|---------------|---------------------------------------|
| Framework     | TanStack Start, React                  |
| Data Fetching | TanStack Query                        |
| Forms         | TanStack Form (custom hooks)          |
| UI Components | ShadCN                                |
| Validation    | Zod                                   |
| Styling       | Tailwind CSS                          |

## 📂 Project Structure

```text
src/
├── lib/
│   ├── queries/       # TanStack Query queries (queryOptions)
│   ├── mutations/     # TanStack Query mutations (mutationOptions)
│   ├── types/         # TypeScript types (generated from backend responses)
│   ├── schemas/       # Zod schemas for form validation
│   └── forms/         # Reusable form configurations (useAppForm, formOptions)
├── components/        # ShadCN-based UI components
├── contexts/          # React contexts (auth.tsx, team.tsx)
└── ...
```

## 🏗️ Architecture

### Data Fetching
- **Queries**: Defined in `src/lib/queries` using TanStack Query's `queryOptions` for consistent, reusable data-fetching logic.
- **Mutations**: Defined in `src/lib/mutations` using TanStack Query's `mutationOptions`.

### Type Generation
Types are generated from Laravel backend responses using the [**Paste JSON as Code**](https://marketplace.visualstudio.com/items?itemName=quicktype.quicktype) VSCode plugin and stored in `src/lib/types`.

### Forms
- Uses TanStack's **`createFormHook`** and **`useAppForm`** for type-safe, reusable form management.
- Forms are configured with `formOptions()` (similar to TanStack Query's pattern).
- Supports registering reusable components (e.g., text inputs, selects) for consistent UX.
- Validation schemas are defined in `src/lib/schemas` using Zod.

### Contexts
- **`auth.tsx`**: Manages the current user's authentication state.
- **`team.tsx`**: Manages the current team context for shared lists.

### Components
- Built primarily with **ShadCN** components for a polished, accessible UI.
- Located in `src/components`.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (recommended)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file in the project root with the following variable:

```env
VITE_SERVER_URL=http://localhost:8000  # URL of your Laravel backend (include port)
```

### Development
```bash
npm run dev
```
The app will be available at [`http://localhost:3000`](http://localhost:3000).
