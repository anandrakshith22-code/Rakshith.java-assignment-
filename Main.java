class BasicStudent {
    String name;
    int age;

    BasicStudent(String name, int age) {
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

        BasicStudent s1 = new BasicStudent("Rahul", 20);

        // Java automatically calls s1.toString()
        System.out.println(s1);
    }
}