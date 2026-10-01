public class ExceptionDemo {
    public static void main(String[] args) {

        // Arithmetic Exception
        try {
            int a = 10;
            int b = 0;

            int result = a / b;

            System.out.println("Result: " + result);
        }
        catch (ArithmeticException e) {
            System.out.println("Arithmetic Exception: Cannot divide by zero.");
        }
        finally {
            System.out.println("Finally block executed for arithmetic operation.");
        }


        // Array Index Out Of Bounds Exception
        try {
            int[] numbers = {10, 20, 30};

            System.out.println("Element: " + numbers[5]);
        }
        catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array Index Out Of Bounds Exception: Invalid index.");
        }
        finally {
            System.out.println("Finally block executed for array operation.");
        }
    }
}