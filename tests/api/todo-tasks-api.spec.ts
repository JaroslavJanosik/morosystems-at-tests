import { test, expect, request, APIRequestContext } from "@playwright/test";
import { randomUUID } from "crypto";
import { CONFIG } from "@config/urls";
import { Task } from "@support/types/Task";

/**
 * Test suite for the ToDo Tasks API, covering CRUD operations and task completion states.
 */
test.describe.parallel("ToDo Tasks API Suite", () => {
    let apiContext: APIRequestContext;

    test.beforeAll(async ({ playwright }) => {
        apiContext = await request.newContext({
            baseURL: CONFIG.API.toDoTasks,
            extraHTTPHeaders: {
                "Content-Type": "application/json",
            },
        });
    });

    test.afterAll(async () => {
        await apiContext.dispose();
    });

    // === Helper functions ===
    async function createTask(taskText: string): Promise<Task> {
        const response = await apiContext.post("/tasks", { data: { text: taskText } });
        expect(response.status()).toBe(200);

        const createdTask: Task = await response.json();
        expect(createdTask).toHaveProperty("id");
        expect(createdTask.text).toBe(taskText);
        expect(createdTask.completed).toBe(false);
        expect(createdTask).toHaveProperty("createdDate");
        expect(typeof createdTask.createdDate).toBe("number");

        return createdTask;
    }

    async function deleteTask(taskId: string): Promise<void> {
        const response = await apiContext.delete(`/tasks/${taskId}`);
        expect([200, 404]).toContain(response.status());
    }

    // === Tests ===
    test("GET /tasks → should return an array of existing tasks including newly created ones", async () => {
        const taskTexts = [
            `GetTaskTest-1-${randomUUID()}`,
            `GetTaskTest-2-${randomUUID()}`,
        ];

        const createdTasks: Task[] = [];
        for (const text of taskTexts) {
            const createdTask = await createTask(text);
            createdTasks.push(createdTask);
        }

        const res = await apiContext.get("/tasks");
        expect(res.status()).toBe(200);

        const tasks: Task[] = await res.json();

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThanOrEqual(createdTasks.length);

        for (const createdTask of createdTasks) {
            const foundTask = tasks.find((t) => t.id === createdTask.id);
            expect(foundTask).toBeDefined();
            expect(foundTask!.text).toBe(createdTask.text);
            expect(foundTask!.completed).toBe(false);
            expect(typeof foundTask!.createdDate).toBe("number");
            expect(foundTask).not.toHaveProperty("completedDate");
        }

        for (const task of createdTasks) {
            await deleteTask(task.id);
        }
    });

    test("POST /tasks → should create a new task", async () => {
        const taskText = `New Task - ${randomUUID()}`;
        const createdTask = await createTask(taskText);

        expect(createdTask.text).toBe(taskText);
        expect(createdTask.completed).toBe(false);
        expect(createdTask).toHaveProperty("createdDate");

        await deleteTask(createdTask.id);
    });

    test("POST /tasks → should fail when 'text' field is missing", async () => {
        const response = await apiContext.post("/tasks", { data: {} });
        expect(response.status()).toBe(422);

        const responseText = await response.text();
        expect(responseText).toContain("'text' field must be present");
    });

    test("POST /tasks/:id → should update task text", async () => {
        const initialTask = await createTask(`Initial Task - ${randomUUID()}`);
        const updatedText = `Updated Task - ${randomUUID()}`;

        const response = await apiContext.post(`/tasks/${initialTask.id}`, { data: { text: updatedText } });
        expect(response.status()).toBe(200);

        const updatedTask: Task = await response.json();
        expect(updatedTask.id).toBe(initialTask.id);
        expect(updatedTask.text).toBe(updatedText);
        expect(updatedTask).toHaveProperty("createdDate");

        await deleteTask(initialTask.id);
    });

    test("POST /tasks/:id → should return 404 for non-existent ID", async () => {
        const response = await apiContext.post(`/tasks/invalid-id-${randomUUID()}`, {
            data: { text: "irrelevant" },
        });
        expect(response.status()).toBe(404);
    });

    test("POST /tasks/:id/complete → should mark a task as completed", async () => {
        const createdTask = await createTask(`Task to Complete - ${randomUUID()}`);

        const response = await apiContext.post(`/tasks/${createdTask.id}/complete`);
        expect(response.status()).toBe(200);

        const completedTask: Task = await response.json();
        expect(completedTask.completed).toBe(true);
        expect(completedTask).toHaveProperty("completedDate");
        expect(typeof completedTask.completedDate).toBe("number");

        await deleteTask(createdTask.id);
    });

    test("GET /tasks/completed → should return only completed tasks", async () => {
        const createdTask = await createTask(`Completed Task - ${randomUUID()}`);
        await apiContext.post(`/tasks/${createdTask.id}/complete`);

        const response = await apiContext.get("/tasks/completed");
        expect(response.status()).toBe(200);

        const completedTasks: Task[] = await response.json();
        expect(Array.isArray(completedTasks)).toBeTruthy();

        if (completedTasks.length > 0) {
            expect(completedTasks.every((t) => t.completed)).toBeTruthy();
            expect(completedTasks.every((t) => typeof t.completedDate === "number")).toBeTruthy();
        }

        await deleteTask(createdTask.id);
    });

    test("POST /tasks/:id/incomplete → should mark a task as incomplete", async () => {
        const createdTask = await createTask(`Task to Toggle - ${randomUUID()}`);
        await apiContext.post(`/tasks/${createdTask.id}/complete`);

        const response = await apiContext.post(`/tasks/${createdTask.id}/incomplete`);
        expect(response.status()).toBe(200);

        const toggledTask: Task = await response.json();
        expect(toggledTask.completed).toBe(false);
        expect(toggledTask.completedDate).toBeUndefined();

        await deleteTask(createdTask.id);
    });

    test("DELETE /tasks/:id → should delete an existing task", async () => {
        const createdTask = await createTask(`Task to Delete - ${randomUUID()}`);

        const response = await apiContext.delete(`/tasks/${createdTask.id}`);
        expect(response.status()).toBe(200);
    });

    test("DELETE /tasks/:id → should return 404 if task does not exist", async () => {
        const response = await apiContext.delete(`/tasks/nonexistent-id-${randomUUID()}`);
        expect(response.status()).toBe(404);
    });
});