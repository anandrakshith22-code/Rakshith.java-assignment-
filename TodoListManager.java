import java.util.ArrayList;

public class TodoListManager {
    public static void main(String[] args) {
        // Create an ArrayList of tasks
        ArrayList<String> todoList = new ArrayList<>();

        // 1. Adding tasks
        todoList.add("Buy groceries");
        todoList.add("Complete Java assignment");
        todoList.add("Go for a run");
        todoList.add("Read a book");

        System.out.println("--- Initial To-Do List ---");
        // Iterating over the ArrayList
        for (String task : todoList) {
            System.out.println("- " + task);
        }

        // 2. Removing a task by index and by object name
        todoList.remove(0);             // Removes "Buy groceries"
        todoList.remove("Go for a run"); // Removes "Go for a run"

        System.out.println("\n--- Updated To-Do List ---");
        // Iterating over the updated ArrayList
        for (int i = 0; i < todoList.size(); i++) {
            System.out.println((i + 1) + ". " + todoList.get(i));
        }
    }
}