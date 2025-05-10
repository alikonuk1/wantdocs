# wantdocs

I don’t like writing documentations. I’d rather focus on coding and have the documentation generated automatically for me. This tool is designed to help with that.

wantdocs is a command-line tool that uses AI to analyze your code and generate or update documentation based on it. It helps keep your codebase and its Markdown documentation synchronized. It analyzes your code and existing documentation, compares them, and suggests updates for your documentation.

## Features (Phase 1 - Local Files)

- Loads code from a specified directory.
- Loads documentation from a specified directory if any.
- Uses an LLM to analyze code and documentation content.
- Compares the analyses to identify discrepancies.
- Generates suggested updates for the documentation based on the comparison.
- CLI interface to specify code, documentation, and output paths.
- Uses a `.env` file for API key management.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/alikonuk1/wantdocs
    cd wantdocs
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Copy the `.env.example` file to a new file named `.env`:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and add your OpenAI API key:
      ```
      OPENAI_API_KEY="your_openai_api_key
      ```

## Usage

You need to provide the path to your codebase and the path to your documentation. An output directory is optional.

```bash
npm start -- --codePath <path_to_your_codebase> --docPath <path_to_your_documentation> [-o <path_to_output_directory>]
```

**Arguments:**

- `--codePath` or `-c`: (Required) Path to the codebase directory (e.g., `./src`).
- `--docPath` or `-d`: (Required) Path to the documentation directory (e.g., `./docs`).
- `--outputDir` or `-o`: (Optional) Directory to save updated documentation files. If not provided, suggestions are printed to the console.

### Example: Generating Documentation for This Repository's Code

To generate/update documentation for the this repo's own source code (located in `./src`) and place/update it in the `./docs` directory, you can run:

```bash
npm start -- --codePath ./src --docPath ./docs -o ./docs
```

This command will:

- Analyze the code in the `./src` directory.
- Analyze any existing Markdown files in the `./docs` directory.
- Compare them and generate suggestions.
- Save the suggested updated documentation file(s) (currently, the first processed document from `./docs`) back into the `./docs` directory, overwriting it if it exists, or creating it if new.

**Important Note on `docPath` and Generating New Documentation:**

wantdocs is primarily designed to **synchronize and update _existing_ documentation**.

- When you specify a `--docPath` (e.g., `./docs`), the tool expects to find Markdown files there to analyze and compare against the code.
- If the `docPath` directory is empty or does not contain relevant Markdown files for the code in `codePath`, the tool's current comparison and update generation logic might not produce comprehensive _new_ documentation from scratch. It looks for existing content to improve.
- For best results when starting with a new project or wanting to generate docs for a codebase with no existing documentation, you might need to:
  1. Create placeholder Markdown files in your `docPath` directory (e.g., `moduleA.md`, `moduleB.md`) that you intend to be populated.
  2. Run the tool. The tool will then attempt to analyze these (potentially empty) files and generate content for them based on the code.

Future versions may include a more explicit "generate from scratch" mode. The current version's strength is in keeping existing documentation aligned with evolving code.

**Mapping Strategy Note:** The current version has a basic mapping strategy and will typically compare the analysis of the first code file found with the analysis of the first documentation file found in the `docPath` to generate an update for that first documentation file. This will be improved in future versions.
