import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 用户数据类型
interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  role: "admin" | "user";
}

// 模拟用户数据库（生产环境应该使用真实数据库）
// 密码: 123 (bcrypt 加密)
const users: User[] = [
  {
    id: "1",
    username: "admin",
    name: "管理员",
    password: "$2b$10$6xiSNuwn/cnOFYZGfM6i1u5j8pG4fl551hxhzSn7Ca9V8hUa7ycsm", // 123
    role: "admin",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("请输入用户名和密码");
        }

        const user = users.find((u) => u.username === credentials.username);

        if (!user) {
          throw new Error("用户不存在");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("密码错误");
        }

        return {
          id: user.id,
          email: user.username, // NextAuth 需要 email 字段，这里用 username 填充
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as User).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "shopify-insight-ai-dev-secret-key-2024",
  debug: process.env.NODE_ENV === "development",
};
