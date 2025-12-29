function executeCode(code, lang) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://emkc.org/api/v2/piston/execute",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                language: lang.language,
                version: lang.version,
                files: [{ content: code }]
            }),
            success: resolve,
            error: reject
        });
    });
}

const LANGUAGE_CONFIG = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "cpp", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    kotlin: { language: "kotlin", version: "1.8.0" },
    python: { language: "python", version: "3.11.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    php: { language: "php", version: "8.2.3" },
    ruby: { language: "ruby", version: "3.2.2" },
    rust: { language: "rust", version: "1.68.2" },
    go: { language: "go", version: "1.20.2" },
    csharp: { language: "csharp", version: "6.12.0" },
    swift: { language: "swift", version: "5.8.1" },
    bash: { language: "bash", version: "5.2.0" }
};

export async function findDuplicatesinarray(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Format array for injection
    const arrString = testCase.arr.join(", ");

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

// Helper for qsort to ensure sorted output
int cmpFunc(const void * a, const void * b) {
   return ( *(int*)a - *(int*)b );
}

${userCode}

int main(){
    int arr[] = {${arrString}};
    int n = ${testCase.size};
    int returnSize = 0;
    
    int* result = findDuplicates(arr, n, &returnSize);
    
    if (returnSize == 0 || result == NULL) {
        printf("-1");
    } else {
        // Sort result for consistent testing
        qsort(result, returnSize, sizeof(int), cmpFunc);
        
        for(int i=0; i<returnSize; i++){
            printf("%d", result[i]);
            if(i < returnSize-1) printf(" ");
        }
        free(result);
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<algorithm>
#include<map>
using namespace std;

${userCode}

int main(){
    vector<int> arr = {${arrString}};
    vector<int> result = findDuplicates(arr);
    
    if (result.empty()) {
        cout << "-1";
    } else {
        sort(result.begin(), result.end());
        for(size_t i=0; i<result.size(); i++){
            cout << result[i];
            if(i < result.size()-1) cout << " ";
        }
    }
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr = {${arrString}};
        int[] result = sol.findDuplicates(arr);
        
        if (result.length == 0) {
            System.out.print("-1");
        } else {
            Arrays.sort(result);
            for(int i=0; i<result.length; i++){
                System.out.print(result[i]);
                if(i < result.length-1) System.out.print(" ");
            }
        }
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const arr = [${arrString}];
const result = findDuplicates(arr);

if (!result || result.length === 0) {
    console.log("-1");
} else {
    result.sort((a, b) => a - b);
    console.log(result.join(" "));
}
`;
    }

    const response = await executeCode(fullcode, lang);

    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    return {
        passed: response.run.output.trim() === testCase.expected,
        output: response.run.output
    };

}
