import java.util.LinkedList;

public class LinkedListDemo {
    public static void main(String[] args) {
        // Create a LinkedList
        LinkedList<String> list = new LinkedList<>();

        // Adding initial elements
        list.add("B");
        list.add("C");

        // 1. Adding elements at first and last positions
        list.addFirst("A"); // Adds to the beginning
        list.addLast("D");  // Adds to the end

        System.out.println("LinkedList: " + list);

        // 2. Accessing elements (First and Last)
        String firstElement = list.getFirst();
        String lastElement = list.getLast();
        System.out.println("First Element: " + firstElement);
        System.out.println("Last Element: " + lastElement);

        // 3. Removing elements (First and Last)
        String removedFirst = list.removeFirst();
        String removedLast = list.removeLast();

        System.out.println("Removed First: " + removedFirst);
        System.out.println("Removed Last: " + removedLast);

        // 4. Accessing and Removing by Index
        String elementAtIndex = list.get(0);
        System.out.println("Element at index 0: " + elementAtIndex);

        list.remove(0); // Removes element at index 0
        System.out.println("Final LinkedList: " + list);
    }
}