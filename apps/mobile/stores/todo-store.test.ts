import { createStore } from "jotai";
import { describe, expect, it } from "vitest";
import {
	type Todo,
	addTodoAtom,
	completedCountAtom,
	removeTodoAtom,
	reorderTodosAtom,
	todosAtom,
	toggleTodoAtom,
} from "./todo-store";

function createTestStore() {
	return createStore();
}

describe("todo-store", () => {
	describe("todosAtom", () => {
		it("初期値は空配列", () => {
			const store = createTestStore();
			expect(store.get(todosAtom)).toEqual([]);
		});
	});

	describe("addTodoAtom", () => {
		it("タスクを追加できる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "お風呂沸かす", emoji: "😊" });

			const todos = store.get(todosAtom);
			expect(todos).toHaveLength(1);
			expect(todos[0].title).toBe("お風呂沸かす");
			expect(todos[0].emoji).toBe("😊");
			expect(todos[0].completed).toBe(false);
		});

		it("複数のタスクを追加できる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "お風呂沸かす", emoji: "😊" });
			store.set(addTodoAtom, { title: "水やり", emoji: "🌱" });

			const todos = store.get(todosAtom);
			expect(todos).toHaveLength(2);
			expect(todos[0].title).toBe("お風呂沸かす");
			expect(todos[1].title).toBe("水やり");
		});

		it("emoji を省略するとデフォルト絵文字が使われる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "テスト" });

			const todos = store.get(todosAtom);
			expect(todos[0].emoji).toBe("📝");
		});
	});

	describe("toggleTodoAtom", () => {
		it("タスクの完了状態をトグルできる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "テスト" });

			const todoId = store.get(todosAtom)[0].id;
			store.set(toggleTodoAtom, todoId);

			expect(store.get(todosAtom)[0].completed).toBe(true);
		});

		it("完了済みタスクを未完了に戻せる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "テスト" });

			const todoId = store.get(todosAtom)[0].id;
			store.set(toggleTodoAtom, todoId);
			store.set(toggleTodoAtom, todoId);

			expect(store.get(todosAtom)[0].completed).toBe(false);
		});
	});

	describe("removeTodoAtom", () => {
		it("タスクを削除できる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "タスク1" });
			store.set(addTodoAtom, { title: "タスク2" });

			const todoId = store.get(todosAtom)[0].id;
			store.set(removeTodoAtom, todoId);

			const todos = store.get(todosAtom);
			expect(todos).toHaveLength(1);
			expect(todos[0].title).toBe("タスク2");
		});
	});

	describe("reorderTodosAtom", () => {
		it("タスクの並び順を変更できる", () => {
			const store = createTestStore();
			store.set(addTodoAtom, { title: "タスク1" });
			store.set(addTodoAtom, { title: "タスク2" });
			store.set(addTodoAtom, { title: "タスク3" });

			const todos = store.get(todosAtom);
			// タスク3 を先頭に移動（fromIndex: 2, toIndex: 0）
			store.set(reorderTodosAtom, { fromIndex: 2, toIndex: 0 });

			const reordered = store.get(todosAtom);
			expect(reordered[0].title).toBe("タスク3");
			expect(reordered[1].title).toBe("タスク1");
			expect(reordered[2].title).toBe("タスク2");
		});
	});

	describe("completedCountAtom", () => {
		it("完了タスク数を返す", () => {
			const store = createTestStore();
			expect(store.get(completedCountAtom)).toBe(0);

			store.set(addTodoAtom, { title: "タスク1" });
			store.set(addTodoAtom, { title: "タスク2" });

			const [id1, id2] = store.get(todosAtom).map((t: Todo) => t.id);
			store.set(toggleTodoAtom, id1);
			expect(store.get(completedCountAtom)).toBe(1);

			store.set(toggleTodoAtom, id2);
			expect(store.get(completedCountAtom)).toBe(2);
		});
	});
});
