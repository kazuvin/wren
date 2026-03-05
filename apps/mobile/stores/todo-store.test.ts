import { beforeEach, describe, expect, it } from "vitest";
import { type Todo, getCompletedCount, useTodoStore } from "./todo-store";

describe("todo-store", () => {
	beforeEach(() => {
		useTodoStore.setState({ todos: [] });
	});

	describe("todos", () => {
		it("初期値は空配列", () => {
			expect(useTodoStore.getState().todos).toEqual([]);
		});
	});

	describe("addTodo", () => {
		it("タスクを追加できる", () => {
			useTodoStore.getState().addTodo({ title: "お風呂沸かす", emoji: "😊" });

			const todos = useTodoStore.getState().todos;
			expect(todos).toHaveLength(1);
			expect(todos[0].title).toBe("お風呂沸かす");
			expect(todos[0].emoji).toBe("😊");
			expect(todos[0].completed).toBe(false);
		});

		it("複数のタスクを追加できる", () => {
			useTodoStore.getState().addTodo({ title: "お風呂沸かす", emoji: "😊" });
			useTodoStore.getState().addTodo({ title: "水やり", emoji: "🌱" });

			const todos = useTodoStore.getState().todos;
			expect(todos).toHaveLength(2);
			expect(todos[0].title).toBe("お風呂沸かす");
			expect(todos[1].title).toBe("水やり");
		});

		it("emoji を省略するとデフォルト絵文字が使われる", () => {
			useTodoStore.getState().addTodo({ title: "テスト" });

			const todos = useTodoStore.getState().todos;
			expect(todos[0].emoji).toBe("📝");
		});
	});

	describe("toggleTodo", () => {
		it("タスクの完了状態をトグルできる", () => {
			useTodoStore.getState().addTodo({ title: "テスト" });

			const todoId = useTodoStore.getState().todos[0].id;
			useTodoStore.getState().toggleTodo(todoId);

			expect(useTodoStore.getState().todos[0].completed).toBe(true);
		});

		it("完了済みタスクを未完了に戻せる", () => {
			useTodoStore.getState().addTodo({ title: "テスト" });

			const todoId = useTodoStore.getState().todos[0].id;
			useTodoStore.getState().toggleTodo(todoId);
			useTodoStore.getState().toggleTodo(todoId);

			expect(useTodoStore.getState().todos[0].completed).toBe(false);
		});
	});

	describe("removeTodo", () => {
		it("タスクを削除できる", () => {
			useTodoStore.getState().addTodo({ title: "タスク1" });
			useTodoStore.getState().addTodo({ title: "タスク2" });

			const todoId = useTodoStore.getState().todos[0].id;
			useTodoStore.getState().removeTodo(todoId);

			const todos = useTodoStore.getState().todos;
			expect(todos).toHaveLength(1);
			expect(todos[0].title).toBe("タスク2");
		});
	});

	describe("reorderTodos", () => {
		it("タスクの並び順を変更できる", () => {
			useTodoStore.getState().addTodo({ title: "タスク1" });
			useTodoStore.getState().addTodo({ title: "タスク2" });
			useTodoStore.getState().addTodo({ title: "タスク3" });

			// タスク3 を先頭に移動（fromIndex: 2, toIndex: 0）
			useTodoStore.getState().reorderTodos({ fromIndex: 2, toIndex: 0 });

			const reordered = useTodoStore.getState().todos;
			expect(reordered[0].title).toBe("タスク3");
			expect(reordered[1].title).toBe("タスク1");
			expect(reordered[2].title).toBe("タスク2");
		});
	});

	describe("getCompletedCount", () => {
		it("完了タスク数を返す", () => {
			expect(getCompletedCount([])).toBe(0);

			useTodoStore.getState().addTodo({ title: "タスク1" });
			useTodoStore.getState().addTodo({ title: "タスク2" });

			const [id1, id2] = useTodoStore.getState().todos.map((t: Todo) => t.id);
			useTodoStore.getState().toggleTodo(id1);
			expect(getCompletedCount(useTodoStore.getState().todos)).toBe(1);

			useTodoStore.getState().toggleTodo(id2);
			expect(getCompletedCount(useTodoStore.getState().todos)).toBe(2);
		});
	});
});
