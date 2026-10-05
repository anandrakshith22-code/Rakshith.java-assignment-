class PrintableStudent {
    String name;
    int rollNo;

    PrintableStudent(String name, int rollNo) {
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
        PrintableStudent s = new PrintableStudent("Alex", 101);
        System.out.println(s);
    }
}