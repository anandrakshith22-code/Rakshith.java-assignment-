public class SentenceSplitter {
    public static void main(String[] args) {
        String sentence = "Java is fun to learn";
        String[] words = sentence.split(" ");

        String rebuilt = "";
        for (String word : words) {
            rebuilt += word + "-";
        }

        System.out.println("Original: " + sentence);
        System.out.println("Rebuilt: " + rebuilt);
    }
}