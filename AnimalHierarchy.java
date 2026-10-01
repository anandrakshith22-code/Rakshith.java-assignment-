class Animal {
    void eat() {
        System.out.println("This animal eats food.");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Dog barks: Woof Woof!");
    }
}

class Rabbit extends Animal {
    void hop() {
        System.out.println("Rabbit hops around.");
    }
}

public class AnimalHierarchy {
    public static void main(String[] args) {
        Dog d = new Dog();
        d.eat();
        d.bark();

        Rabbit r = new Rabbit();
        r.eat();
        r.hop();
    }