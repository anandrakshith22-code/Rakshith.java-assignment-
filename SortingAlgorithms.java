public class SortingAlgorithms {
    public static void selectionSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }

    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {64, 25, 12, 22, 11};
        selectionSort(arr1);
        System.out.print("Selection Sorted: ");
        for (int num : arr1) System.out.print(num + " ");
        System.out.println();

        int[] arr2 = {12, 11, 13, 5, 6};
        insertionSort(arr2);
        System.out.print("Insertion Sorted: ");
        for (int num : arr2) System.out.print(num + " ");
    }
}