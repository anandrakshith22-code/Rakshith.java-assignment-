import java.util.Scanner;

public class StudentGrade {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter student marks: ");
        int marks = sc.nextInt();

        if (marks > 90) {
            System.out.println("Grade: A");
        } else {
            System.out.println("Grade: B or lower");
        }

        if (marks >= 40) {
            System.out.println("Status: Passed");
        } else {
            System.out.println("Status: Failed");
        }
    }
}