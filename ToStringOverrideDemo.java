class Student {
    String name;
    int rollNo;

    Student(String name, int rollNo) {
        this.name = name;
        this.rollNo = rollNo;
    }

    @Override
    public String toString() {
        return "Student Name: " + name + ", Roll No: " + rollNo;
    }
}

public class ToStringOverrideDemo {
    public static void main(String[] args) {
        Student s = new Student("Alex", 101);
        System.out.println(s);
    }
}