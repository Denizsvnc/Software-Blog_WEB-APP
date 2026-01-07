import { prisma } from "../src/lib/prisma.js";
import bcryptjs from 'bcryptjs';

async function main() {
  console.log('🌱 Starting to add seed data...');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Kategoriler oluştur
  console.log('Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology news and articles',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Programming',
        slug: 'programming',
        description: 'Programming languages and tools',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Web application development',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Databases',
        slug: 'databases',
        description: 'Database management and design',
      },
    }),
  ]);

  // Kullanıcılar oluştur
  console.log('Creating users...');
  const hashedPassword = await bcryptjs.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: new Date(),
        bio: 'System administrator',
        avatarUrl: 'https://ui-avatars.com/api/?name=Admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor@example.com',
        username: 'editor',
        password: hashedPassword,
        name: 'Editor User',
        role: 'EDITOR',
        status: 'ACTIVE',
        emailVerified: new Date(),
        bio: 'Content editor',
        avatarUrl: 'https://ui-avatars.com/api/?name=Editor',
      },
    }),
    prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user',
        password: hashedPassword,
        name: 'Regular User',
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: new Date(),
        bio: 'Blog reader',
        avatarUrl: 'https://ui-avatars.com/api/?name=User',
      },
    }),
  ]);

  // Posts create
  console.log('Creating posts...');
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'What is Node.js? Basic Information',
        slug: 'what-is-nodejs-basic-information',
        content: `Node.js is a JavaScript runtime that allows you to run JavaScript code on the server side.
        
Node.js uses the V8 JavaScript engine used by Google Chrome to provide high performance.
        
## Node.js Advantages:
- Fast and scalable
- Event-driven architecture
- Extensive package ecosystem (npm)
- Server-side development using JavaScript
        
With Node.js you can develop RESTful APIs, real-time applications and various server applications.`,
        published: true,
        viewCount: 245,
        authorId: users[1].id,
        categories: {
          connect: [
            { id: categories[0].id }, // Technology
            { id: categories[1].id }, // Programming
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'Writing Safe Code with TypeScript',
        slug: 'writing-safe-code-with-typescript',
        content: `TypeScript is a programming language built on top of JavaScript that provides static type checking.

## Why Should TypeScript Be Used?
- Type safety
- Catch errors early during development
- Better IDE support
- More readable code
        
TypeScript code cannot be run directly by browsers, it needs to be compiled to JavaScript.`,
        published: true,
        viewCount: 189,
        authorId: users[1].id,
        categories: {
          connect: [
            { id: categories[1].id }, // Programming
            { id: categories[2].id }, // Web Development
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'React Hooks Guide',
        slug: 'react-hooks-guide',
        content: `React Hooks allow you to use state and lifecycle features in functional components.

## Basic Hooks:
- useState: State management
- useEffect: Side effects
- useContext: Context usage
- useReducer: Complex state management
        
Thanks to Hooks, there is no need to write class components anymore and the code became simpler.`,
        published: true,
        viewCount: 412,
        authorId: users[1].id,
        categories: {
          connect: [
            { id: categories[1].id }, // Programming
            { id: categories[2].id }, // Web Development
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'PostgreSQL Database Design',
        slug: 'postgresql-database-design',
        content: `PostgreSQL is a powerful open source relational database management system.

## PostgreSQL Features:
- ACID compliance
- JSON support
- Powerful indexing
- Extensibility
        
In this article you will learn everything from PostgreSQL installation to database design and optimization.`,
        published: true,
        viewCount: 156,
        authorId: users[1].id,
        categories: {
          connect: [
            { id: categories[3].id }, // Databases
          ],
        },
      },
    }),
    prisma.post.create({
      data: {
        title: 'REST API Design Practices',
        slug: 'rest-api-design-practices',
        content: `REST (Representational State Transfer) is a common architectural style for building web services.

## REST API Principles:
- Client-Server architecture
- Stateless communication
- Cacheable responses
- Uniform interface
        
Well-designed REST APIs will help you create scalable and maintainable applications.`,
        published: true,
        viewCount: 328,
        authorId: users[0].id,
        categories: {
          connect: [
            { id: categories[2].id }, // Web Development
            { id: categories[1].id }, // Programming
          ],
        },
      },
    }),
  ]);

  // Add likes
  console.log('Adding likes...');
  await Promise.all([
    prisma.like.create({
      data: {
        userId: users[0].id,
        postId: posts[0].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[2].id,
        postId: posts[0].id,
      },
    }),
    prisma.like.create({
      data: {
        userId: users[0].id,
        postId: posts[1].id,
      },
    }),
  ]);

  // Add comments
  console.log('Adding comments...');
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Very helpful article! Thanks.',
        userId: users[2].id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I would like more examples about Node.js.',
        userId: users[0].id,
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I prefer TypeScript!',
        userId: users[1].id,
        postId: posts[1].id,
      },
    }),
  ]);

  console.log('✅ Seed data successfully added!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Hata oluştu:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
