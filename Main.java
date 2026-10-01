class Student {
    String name;
    int age;

    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Overriding toString() from Object
    @Override
    public String toString() {
        return "Student{name='" + name + "', age=" + age + "}";
    }
}

public class Main {
    public static void main(String[] args) {

        Student s1 = new Student("Rahul", 20);

        // Java automatically calls s1.toString()
        System.out.println(s1);
    }
}