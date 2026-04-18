# StrayPetMap

<div align="center">

![StrayPetMap](https://img.shields.io/badge/StrayPetMap-Next.js%2016+-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern web platform connecting stray animals with loving homes**

[Live Demo](https://stray-pet-map.vercel.app) · [Documentation](#documentation) · [Report Bug](https://github.com/your-username/stray-pet-map/issues) · [Request Feature](https://github.com/your-username/stray-pet-map/issues)

</div>

## Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

StrayPetMap is a compassionate web platform designed to help stray animals find loving homes. Built with modern web technologies and following Clean Architecture principles, it provides a seamless experience for both animal rescuers and potential adopters.

### Our Mission

> "To create a centralized platform that bridges the gap between stray animals in need and compassionate individuals willing to help, ultimately reducing the number of animals living on the streets."

### Key Impact Areas

- **Animal Welfare**: Provide visibility for animals in need of care
- **Community Engagement**: Foster a community of animal lovers and rescuers
- **Adoption Facilitation**: Streamline the process of connecting animals with permanent homes
- **Resource Coordination**: Help coordinate rescue efforts and resource sharing

---

## Features

### Core Functionality

- **Interactive Map**: Real-time visualization of animal locations using MapLibre GL
- **Advanced Search**: Filter animals by type, breed, location, and status
- **Multi-step Post Creation**: Guided wizard for creating detailed animal profiles
- **Adoption Requests**: Streamlined process for interested adopters
- **Favorites System**: Bookmark animals of interest
- **Authentication**: Secure user management with Supabase Auth

### Gamification System

- **Badge System**: 8 different achievement types with 4 tiers (Bronze, Silver, Gold, Platinum)
- **Progress Tracking**: Visual progress indicators for each achievement
- **Leaderboard**: Community rankings and recognition
- **Impact Metrics**: Personal dashboard showing contribution impact

### User Experience

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Dark/Light Theme**: Accessible theme switching
- **Real-time Updates**: Live data synchronization
- **Accessibility**: WCAG compliant interface
- **Internationalization**: Thai language support with Noto Sans Thai

---

## Technology Stack

### Frontend

| Technology          | Version | Purpose                             |
| ------------------- | ------- | ----------------------------------- |
| **Next.js**         | 16.2.3  | React framework with App Router     |
| **TypeScript**      | 5.x     | Type-safe development               |
| **TailwindCSS**     | v4      | Utility-first styling               |
| **React Hook Form** | 7.x     | Form management with Zod validation |
| **Zustand**         | 5.x     | State management                    |
| **MapLibre GL**     | 5.x     | Interactive mapping                 |
| **react-spring**    | 10.x    | Smooth animations                   |
| **lucide-react**    | Latest  | Icon library                        |

### Backend & Database

| Technology             | Version | Purpose                 |
| ---------------------- | ------- | ----------------------- |
| **Supabase**           | Latest  | Database, Auth, Storage |
| **PostgreSQL**         | Latest  | Primary database        |
| **Row Level Security** | -       | Data access control     |
| **Storage API**        | -       | Image management        |

### Development Tools

| Technology     | Version | Purpose               |
| -------------- | ------- | --------------------- |
| **ESLint**     | Latest  | Code linting          |
| **Prettier**   | Latest  | Code formatting       |
| **TypeScript** | Strict  | Type checking         |
| **Git Hooks**  | -       | Pre-commit validation |

---

## Architecture

```
StrayPetMap follows Clean Architecture principles:

app/                    # Next.js App Router
src/
  domain/               # Business entities and types
    entities/           # Core business logic
    types/              # TypeScript definitions
  application/          # Use cases and interfaces
    repositories/       # Repository interfaces
  infrastructure/       # External dependencies
    repositories/      # Repository implementations
      api/            # Client-side API calls
      supabase/       # Server-side Supabase
      mock/           # Development data
    supabase/         # Database configuration
  presentation/        # UI layer
    components/       # React components
    presenters/      # Business logic presenters
    stores/          # State management
    validations/     # Form schemas
```

### Design Patterns

- **Repository Pattern**: Abstract data access layer
- **Presenter Pattern**: Separation of UI and business logic
- **Factory Pattern**: Dynamic presenter creation
- **Observer Pattern**: State management with Zustand

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/stray-pet-map.git
   cd stray-pet-map
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Start local Supabase
   supabase start
   ```

4. **Run database migrations**

   ```bash
   supabase db reset
   ```

5. **Generate TypeScript types**

   ```bash
   npm run supabase-generate
   ```

6. **Environment setup**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

7. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Stray Pet Map"

# Optional: Direct database access
DATABASE_URL=postgresql://postgres:your_password@localhost:54322/postgres
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Navigate to Settings > API
4. Copy the Project URL and anon key
5. For service role key, go to Settings > Database

---

## Database Schema

### Core Tables

| Table               | Description                               |
| ------------------- | ----------------------------------------- |
| `pet_types`         | Animal species and breeds                 |
| `pet_posts`         | Animal listings with location and details |
| `pet_images`        | Image attachments for posts               |
| `adoption_requests` | Adoption application records              |
| `favorites`         | User bookmarks                            |
| `reports`           | Content moderation                        |
| `profile_badges`    | User achievements                         |

### Key Relationships

```mermaid
erDiagram
    profiles ||--o{ pet_posts : creates
    pet_posts ||--o{ pet_images : has
    pet_posts ||--o{ adoption_requests : receives
    pet_posts ||--o{ favorites : bookmarked
    profiles ||--o{ profile_badges : earns
    pet_types ||--o{ pet_posts : categorizes
```

### Migration Files

- `20260212000000_stray_pet_map_schema.sql` - Core schema
- `20260412000000_add_badges_system.sql` - Gamification system
- Additional migrations for security policies and API functions

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/login`    | User authentication |
| POST   | `/api/auth/register` | User registration   |
| POST   | `/api/auth/logout`   | User logout         |

### Pet Post Endpoints

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/pet-posts`      | List all pet posts  |
| POST   | `/api/pet-posts`      | Create new pet post |
| GET    | `/api/pet-posts/[id]` | Get specific post   |
| PATCH  | `/api/pet-posts/[id]` | Update post         |
| GET    | `/api/pet-types`      | Get animal types    |

### Adoption Endpoints

| Method | Endpoint                             | Description             |
| ------ | ------------------------------------ | ----------------------- |
| GET    | `/api/adoption-requests`             | List adoption requests  |
| POST   | `/api/adoption-requests`             | Create adoption request |
| GET    | `/api/adoption-requests/my-requests` | User's requests         |

### Badge Endpoints

| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| GET    | `/api/badges`         | Get all badges  |
| GET    | `/api/badges/profile` | Get user badges |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "message": "Operation completed successfully"
}
```

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- Follow TypeScript strict mode
- Use ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Issue Reporting

When reporting issues, please include:

- **Environment**: OS, browser, Node.js version
- **Reproduction steps**: Detailed steps to reproduce
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 StrayPetMap

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Contact

### Project Maintainer

**Marosdee Uma**

- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com
- Twitter: [@your-twitter](https://twitter.com/your-twitter)

### Project Links

- [Project Homepage](https://github.com/your-username/stray-pet-map)
- [Live Demo](https://stray-pet-map.vercel.app)
- [Documentation](https://docs.stray-pet-map.vercel.app)
- [Issue Tracker](https://github.com/your-username/stray-pet-map/issues)

### Community

- [Discord Server](https://discord.gg/your-server)
- [Facebook Group](https://facebook.com/groups/your-group)
- [LinkedIn Page](https://linkedin.com/company/your-company)

---

## Acknowledgments

- **Supabase** - For providing the excellent backend-as-a-service platform
- **Next.js Team** - For the amazing React framework
- **TailwindCSS** - For the utility-first CSS framework
- **MapLibre** - For the open-source mapping solution
- **All Contributors** - Everyone who has contributed to this project

### Special Thanks

- To all the animal rescuers and shelters who inspired this project
- To the open-source community for making tools like this possible
- To everyone who has helped stray animals find loving homes

---

<div align="center">

**Made with compassion for our furry friends**

[![Star](https://img.shields.io/github/stars/your-username/stray-pet-map.svg?style=social&label=Star)](https://github.com/your-username/stray-pet-map)
[![Fork](https://img.shields.io/github/forks/your-username/stray-pet-map.svg?style=social&label=Fork)](https://github.com/your-username/stray-pet-map/fork)
[![Watch](https://img.shields.io/github/watchers/your-username/stray-pet-map.svg?style=social&label=Watch)](https://github.com/your-username/stray-pet-map)

_"Until every animal has a home"_

</div>
