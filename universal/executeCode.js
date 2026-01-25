export async function executeCode(code, language) {
    const PISTON_API = "https://emkc.org/api/v2/piston";

    try {
        // 1️⃣ Fetch all runtimes
        const runtimesRes = await fetch(`${PISTON_API}/runtimes`);
        if (!runtimesRes.ok) throw new Error("Failed to fetch runtimes");

        const runtimes = await runtimesRes.json();

        // 2️⃣ Find latest version for the language
        const matches = runtimes.filter(r => r.language === language);

        if (!matches.length) {
            throw new Error(`Language not supported: ${language}`);
        }

        const latest = matches.sort((a, b) =>
            a.version.localeCompare(b.version, undefined, { numeric: true })
        ).at(-1);

        const version = latest.version;

        // 3️⃣ Execute code
        const execRes = await fetch(`${PISTON_API}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language,
                version,
                files: [{ content: code }]
            })
        });

        if (!execRes.ok) {
            throw new Error("Execution request failed");
        }

        const result = await execRes.json();

        return {
            stdout: result.run?.stdout || "",
            stderr: result.run?.stderr || "",
            output: (result.run?.stdout || "") + (result.run?.stderr || ""),
            code: result.run?.code,
            signal: result.run?.signal,
            language,
            version
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
