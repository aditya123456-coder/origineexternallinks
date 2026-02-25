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

export async function adjMatrixgraph(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Create comma-separated string for C/Java/CPP: "0, 1, 1, 2"
    const flatEdgesStr = testCase.edges.join(", ");
    // For Empty case
    const safeFlatEdgesStr = testCase.edges.length > 0 ? flatEdgesStr : "0"; 

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

${userCode}

int main(){
    int V = ${testCase.v};
    // Flat array input
    int flatEdges[] = {${safeFlatEdgesStr}};
    int totalItems = ${testCase.edges.length};
    int E = totalItems / 2;
    
    // Reconstruct 2D array for user function
    // Handle E=0 case by allocating size 1 to prevent compiler errors
    int edges[E > 0 ? E : 1][2];
    
    if (E > 0) {
        for(int i=0; i<E; i++) {
            edges[i][0] = flatEdges[2*i];
            edges[i][1] = flatEdges[2*i+1];
        }
    }
    
    int returnSize;
    int* returnColumnSizes;
    
    int** result = createAdjMatrix(V, E, edges, &returnSize, &returnColumnSizes);
    
    for(int i=0; i<returnSize; i++) {
        for(int j=0; j<returnColumnSizes[i]; j++) {
            printf("%d", result[i][j]);
            if(j < returnColumnSizes[i] - 1) printf(" ");
        }
        if(i < returnSize - 1) printf("\\n");
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
using namespace std;

${userCode}

int main(){
    int V = ${testCase.v};
    vector<int> flatEdges = {${safeFlatEdgesStr}};
    int E = ${testCase.edges.length} / 2;
    
    // Reconstruct 2D vector
    vector<vector<int>> edges;
    if (E > 0) {
        for(int i=0; i<E; i++) {
            vector<int> edge;
            edge.push_back(flatEdges[2*i]);
            edge.push_back(flatEdges[2*i+1]);
            edges.push_back(edge);
        }
    }
    
    vector<vector<int>> result = createAdjMatrix(V, edges);
    
    for(size_t i=0; i<result.size(); i++) {
        for(size_t j=0; j<result[i].size(); j++) {
            cout << result[i][j];
            if(j < result[i].size() - 1) cout << " ";
        }
        if(i < result.size() - 1) cout << "\\n";
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
        int V = ${testCase.v};
        int[] flatEdges = {${safeFlatEdgesStr}};
        int E = ${testCase.edges.length} / 2;
        
        // Reconstruct 2D array
        int[][] edges = new int[E][2];
        if (E > 0) {
            for(int i=0; i<E; i++) {
                edges[i][0] = flatEdges[2*i];
                edges[i][1] = flatEdges[2*i+1];
            }
        }
        
        int[][] result = sol.createAdjMatrix(V, edges);
        
        for(int i=0; i<result.length; i++) {
            for(int j=0; j<result[i].length; j++) {
                System.out.print(result[i][j]);
                if(j < result[i].length - 1) System.out.print(" ");
            }
            if(i < result.length - 1) System.out.print("\\n");
        }
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const V = ${testCase.v};
const flatEdges = [${flatEdgesStr}];
const edges = [];

// Reconstruct 2D array
for(let i=0; i<flatEdges.length; i+=2) {
    edges.push([flatEdges[i], flatEdges[i+1]]);
}

const result = createAdjMatrix(V, edges);

// Print formatted
for(let i=0; i<result.length; i++) {
    console.log(result[i].join(" "));
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
        passed: response.run.output.trim() === testCase.expected.trim(),
        output: response.run.output
    };

}
