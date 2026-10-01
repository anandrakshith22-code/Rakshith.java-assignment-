class Student {
    String name;
    int marks;

    // Method to display student details
    void display() {
        System.out.println("Name: " + name);
        System.out.println("Marks: " + marks);
    }
}

public class Main {
    public static void main(String[] args) {

        // First student object
        Student student1 = new Student();
        student1.name = "Rahul";
        student1.marks = 85;

        // Second student object
        Student student2 = new Student();
        student2.name = "Priya";
        student2.marks = 92;

        // Display details
        System.out.println("Student 1:");
        student1.display();

        System.out.println("\nStudent 2:");
        student2.display();
    }
}