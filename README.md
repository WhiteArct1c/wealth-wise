# Wealth Wise 💰

A modern, full-featured personal finance management application built with Next.js and Supabase. Track your accounts, transactions, categories, and financial goals with beautiful visualizations and insights.

![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.89.0-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 📊 Dashboard
- **Financial Overview**: Get a comprehensive view of your financial health at a glance
- **Interactive Charts**: Visualize cash flow, expenses by category, balance evolution, and more
- **Recent Transactions**: Quick access to your latest financial activities
- **Goal Progress**: Track your financial goals with progress indicators
- **Transaction Status**: Monitor pending, completed, and overdue transactions

### 💳 Account Management
- Create and manage multiple bank accounts
- Track account balances and status
- Activate/deactivate accounts as needed
- View account summaries and statistics

### 📝 Transaction Management
- Record income and expenses
- Categorize transactions for better organization
- Support for recurring transactions
- Filter and search transactions
- Pagination for large transaction lists
- Transaction status tracking (pending, completed, overdue)

### 🏷️ Category Management
- Create custom categories for transactions
- Organize expenses by type
- Visual category representation
- Category-based expense analysis

### 🎯 Financial Goals
- Set and track financial goals
- Monitor progress toward targets
- Make contributions to goals
- Visualize goal completion status

### 🔐 Authentication & Security
- Secure authentication with Supabase Auth
- Email verification with OTP
- Protected routes and middleware
- Session management

### 🎨 Modern UI/UX
- Beautiful, responsive design
- Dark mode support
- Accessible components (shadcn/ui)
- Mobile-friendly interface
- Smooth animations and transitions

## 🛠️ Tech Stack

### Core
- **Next.js 16.1.0** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5.0** - Type safety
- **Supabase** - Backend as a Service (Auth, Database)

### UI & Styling
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Chart library for data visualization

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### State Management
- **React Context** - Global state management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management

### Utilities
- **date-fns** - Date manipulation
- **next-themes** - Theme management
- **Sonner** - Toast notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **Supabase account** (for backend services)
- **Git** (for version control)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/wealth-wise.git
cd wealth-wise
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_publishable_key
```

You can find these values in your Supabase project settings under API.

### 4. Set Up Supabase Database

You'll need to create the following tables in your Supabase database:

- `users` - User profiles
- `accounts` - Bank accounts
- `categories` - Transaction categories
- `transactions` - Financial transactions
- `recurring_transactions` - Recurring transaction templates
- `goals` - Financial goals

Refer to your database schema documentation for the exact table structure.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🐳 Docker Setup

Wealth Wise can be run in a Docker container for easy deployment. See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

### Quick Start with Docker

```bash
# Using Docker Compose (recommended)
docker-compose up --build

# Or using Docker directly
docker build -t wealth-wise .
docker run -p 3000:3000 --env-file .env wealth-wise
```

## 📁 Project Structure

```
wealth-wise/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/             # Protected app routes
│   │   │   ├── accounts/      # Account management
│   │   │   ├── categories/    # Category management
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── goals/         # Goals management
│   │   │   └── transactions/  # Transaction management
│   │   ├── actions/           # Server actions
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   │   ├── accounts/          # Account components
│   │   ├── auth/              # Auth components
│   │   ├── categories/        # Category components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── goals/             # Goal components
│   │   ├── shared/            # Shared components
│   │   ├── transactions/      # Transaction components
│   │   └── ui/                # UI component library
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase client setup
│   │   └── validations/       # Zod validation schemas
│   ├── server/                # Server-side functions
│   └── constants/             # Application constants
├── public/                    # Static assets
├── middleware.ts              # Next.js middleware
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔧 Configuration

### Next.js Configuration

The project uses Next.js 16.1.0 with:
- App Router for routing
- React Compiler enabled
- Standalone output mode for Docker

### Tailwind CSS

Tailwind CSS 4.0 is configured with custom theme settings. The configuration can be found in `tailwind.config.ts`.

### Supabase

The application uses Supabase for:
- Authentication (email/password with OTP)
- Database (PostgreSQL)
- Real-time subscriptions (if needed)

## 🎨 Customization

### Themes

The application supports light and dark themes. Theme switching is handled by `next-themes` and can be customized in the theme provider.

### Components

UI components are built with shadcn/ui and can be customized by modifying the component files in `src/components/ui/`.

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

## 🐛 Troubleshooting

### Rate Limit Errors

If you encounter Supabase rate limit errors, ensure that:
- The middleware matcher excludes static assets
- Authentication checks are not redundant
- Error handling is properly implemented

### Turbopack Issues

If you experience Turbopack crashes, you can:
- Disable React Compiler in `next.config.ts`
- Use the standard webpack bundler: `npm run dev -- --no-turbo`

### Build Errors

If you encounter build errors:
- Clear the `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check environment variables are properly set

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📧 Support

For support, email whitearct1c@proton.me or open an issue in the GitHub repository.

---

Made with ❤️ for better financial management
