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

export async function isConnectedGraph(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Create comma-separated string for C/Java/CPP: "0, 1, 1, 0, ..."
    const flatMatrixStr = testCase.matrix.join(", ");
    
    // For empty array safety
    const safeFlatMatrixStr = testCase.matrix.length > 0 ? flatMatrixStr : "0";

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<stdbool.h>

${userCode}

int main(){
    int V = ${testCase.v};
    int flatMatrix[] = {${safeFlatMatrixStr}};
    
    // Reconstruct 2D array (int**)
    int** adj = (int**)malloc(V * sizeof(int*));
    for(int i=0; i<V; i++) {
        adj[i] = (int*)malloc(V * sizeof(int));
        for(int j=0; j<V; j++) {
            adj[i][j] = flatMatrix[i * V + j];
        }
    }
    
    printf("%d", isConnected(V, adj));
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<queue>
using namespace std;

${userCode}

int main(){
    int V = ${testCase.v};
    vector<int> flatMatrix = {${safeFlatMatrixStr}};
    
    // Reconstruct 2D Vector
    vector<vector<int>> adj(V, vector<int>(V));
    for(int i=0; i<V; i++) {
        for(int j=0; j<V; j++) {
            adj[i][j] = flatMatrix[i * V + j];
        }
    }
    
    cout << isConnected(V, adj);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int V = ${testCase.v};
        int[] flatMatrix = {${safeFlatMatrixStr}};
        
        // Reconstruct 2D Array
        int[][] adj = new int[V][V];
        for(int i=0; i<V; i++) {
            for(int j=0; j<V; j++) {
                adj[i][j] = flatMatrix[i * V + j];
            }
        }
        
        System.out.print(sol.isConnected(V, adj));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const V = ${testCase.v};
const flatMatrix = [${flatMatrixStr}];
const adj = [];

// Reconstruct 2D Array
for(let i=0; i<V; i++) {
    const row = [];
    for(let j=0; j<V; j++) {
        row.push(flatMatrix[i * V + j]);
    }
    adj.push(row);
}

console.log(isConnected(V, adj));
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
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };

}
