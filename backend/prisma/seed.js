"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
async function main() {
    const salt = await bcrypt_1.default.genSalt(10);
    const adminHash = await bcrypt_1.default.hash('adminpass', salt);
    const memberHash = await bcrypt_1.default.hash('memberpass', salt);
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.projectMember.deleteMany();
    await prisma.project.deleteMany();
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: client_1.Role.ADMIN
        }
    });
    const member = await prisma.user.upsert({
        where: { email: 'member@example.com' },
        update: {},
        create: {
            name: 'Member User',
            email: 'member@example.com',
            passwordHash: memberHash,
            role: client_1.Role.MEMBER
        }
    });
    const projectA = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Redesign the marketing website',
            ownerId: admin.id,
            members: {
                create: [
                    { userId: admin.id, role: client_1.Role.ADMIN },
                    { userId: member.id, role: client_1.Role.MEMBER }
                ]
            }
        }
    });
    const projectB = await prisma.project.create({
        data: {
            name: 'Mobile App',
            description: 'Build mobile app MVP',
            ownerId: member.id,
            members: {
                create: [
                    { userId: member.id, role: client_1.Role.ADMIN },
                    { userId: admin.id, role: client_1.Role.MEMBER }
                ]
            }
        }
    });
    const tasks = [
        {
            title: 'Hero section copy',
            description: 'Write new hero copy and CTA',
            status: client_1.TaskStatus.TODO,
            priority: client_1.Priority.MEDIUM,
            projectId: projectA.id,
            createdById: admin.id,
            assigneeId: member.id,
        },
        {
            title: 'Design new icons',
            description: 'Create a set of icons for features section',
            status: client_1.TaskStatus.IN_PROGRESS,
            priority: client_1.Priority.HIGH,
            projectId: projectA.id,
            createdById: admin.id,
            assigneeId: admin.id,
        },
        {
            title: 'Setup analytics',
            description: 'Integrate analytics and goals',
            status: client_1.TaskStatus.REVIEW,
            priority: client_1.Priority.MEDIUM,
            projectId: projectB.id,
            createdById: member.id,
            assigneeId: member.id,
        },
        {
            title: 'Login flow',
            description: 'Implement login + jwt auth',
            status: client_1.TaskStatus.TODO,
            priority: client_1.Priority.HIGH,
            projectId: projectB.id,
            createdById: member.id,
            assigneeId: admin.id,
        },
        {
            title: 'Release notes draft',
            description: 'Draft release notes for v0.1',
            status: client_1.TaskStatus.DONE,
            priority: client_1.Priority.LOW,
            projectId: projectA.id,
            createdById: admin.id,
            assigneeId: member.id,
        }
    ];
    for (const t of tasks) {
        await prisma.task.create({ data: t });
    }
    console.log('Seed finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
