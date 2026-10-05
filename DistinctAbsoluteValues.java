import java.util.HashSet;
import java.util.Set;

public class DistinctAbsoluteValues {
    public static int countDistinctAbs(int[] arr) {
        Set<Long> set = new HashSet<>();

        for (int x : arr) {
            set.add(Math.abs((long) x));
        }

        return set.size();
    }

    public static void main(String[] args) {
        int[] arr = {-5, 5, -2, 2, 2, 0};

        System.out.println(countDistinctAbs(arr)); // 3
    }
}