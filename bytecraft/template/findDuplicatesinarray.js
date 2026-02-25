function executeCode(code, lang) {
    return new Promise((resolve, reject) => {

        $.ajax({
            url: "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                source_code: code,
                language_id: lang.language_id,
                stdin: "",
                cpu_time_limit: 5,
                memory_limit: 128000
            }),
            success: function (response) {

                // Convert Judge0 response → Piston-like structure
                resolve({
                    run: {
                        stdout: response.stdout || "",
                        stderr: response.stderr || response.compile_output || "",
                        output:
                            (response.stdout || "") +
                            (response.stderr || "") +
                            (response.compile_output || ""),
                        code: response.status?.id || 0,
                        signal: response.status?.description || null
                    }
                });

            },
            error: function (xhr) {
                reject({
                    run: {
                        stdout: "",
                        stderr: xhr.responseText || "Execution failed",
                        output: xhr.responseText || "Execution failed",
                        code: -1,
                        signal: null
                    }
                });
            }
        });

    });
}


const LANGUAGE_CONFIG = {
    c: { language_id: 50 },
    cpp: { language_id: 54 },
    java: { language_id: 62 },
    kotlin: { language_id: 78 },
    python: { language_id: 71 },
    javascript: { language_id: 63 },
    typescript: { language_id: 74 },
    php: { language_id: 68 },
    ruby: { language_id: 72 },
    rust: { language_id: 73 },
    go: { language_id: 60 },
    csharp: { language_id: 51 },
    swift: { language_id: 83 },
    bash: { language_id: 46 }
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

