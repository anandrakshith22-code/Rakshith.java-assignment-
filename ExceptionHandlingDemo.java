public class ExceptionHandlingDemo {
    public static void main(String[] args) {
        
        // Example 1: Handling ArithmeticException
        System.out.println("--- Test 1: Arithmetic Exception ---");
        try {
            int a = 10;
            int b = 0;
            int result = a / b; // Throws ArithmeticException (division by zero)
            System.out.println("Result: " + result);
        } catch (ArithmeticException e) {
            System.out.println("Caught Exception: Cannot divide by zero!");
        } finally {
            System.out.println("Finally block executed for Test 1.\n");
        }

        // Example 2: Handling ArrayIndexOutOfBoundsException
        System.out.println("--- Test 2: Array Index Out Of Bounds Exception ---");
        try {
            int[] numbers = {1, 2, 3};
            System.out.println("Accessing 5th element: " + numbers[4]); // Throws ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught Exception: Array index is out of bounds!");
        } finally {
            System.out.println("Finally block executed for Test 2.");
        }
    }
}