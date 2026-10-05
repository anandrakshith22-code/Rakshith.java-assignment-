class StudentDetails {
    String name;
    int marks;

    // Method to display student details
    void display() {
        System.out.println("Name: " + name);
        System.out.println("Marks: " + marks);
    }
}

public class StudentDetailsDemo {
    public static void main(String[] args) {

        // First student object
        StudentDetails student1 = new StudentDetails();
        student1.name = "Rahul";
        student1.marks = 85;

        // Second student object
        StudentDetails student2 = new StudentDetails();
        student2.name = "Priya";
        student2.marks = 92;

        // Display details
        System.out.println("Student 1:");
        student1.display();

        System.out.println("\nStudent 2:");
        student2.display();
    }
}