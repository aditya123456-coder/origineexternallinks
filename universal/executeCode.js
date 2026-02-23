export async function executeCode(code, language) {

    // ✅ Official Free Judge0 Endpoint (NO API KEY REQUIRED)
    const JUDGE0_API = "https://ce.judge0.com";

    const LANGUAGE_MAP = {
        c: 50,
        cpp: 54,
        python: 71,
        java: 62,
        javascript: 63,
        php: 68,
        go: 60,
        ruby: 72,
        kotlin: 78,
        csharp: 51,
        swift: 83
    };

    const language_id = LANGUAGE_MAP[language];

    if (!language_id) {
        return {
            stdout: "",
            stderr: "Language not supported",
            output: "Language not supported",
            code: -1,
            signal: null,
            language,
            version: null
        };
    }

    try {

        const response = await fetch(
            `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: language_id,
                    stdin: "",              // optional input
                    cpu_time_limit: 5,      // safety limit
                    memory_limit: 128000    // 128MB
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Execution failed: ${errorText}`);
        }

        const result = await response.json();

        return {
            stdout: result.stdout || "",
            stderr: result.stderr || result.compile_output || "",
            output:
                (result.stdout || "") +
                (result.stderr || "") +
                (result.compile_output || ""),
            code: result.status?.id || 0,
            signal: result.status?.description || null,
            language,
            version: null
        };

    } catch (err) {
        return {
            stdout: "",
            stderr: err.message,
            output: err.message,
            code: -1,
            signal: null,
            language,
            version: null
        };
    }
}
