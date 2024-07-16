import { CodeHighlight } from "@mantine/code-highlight";
import { Anchor, Container, Group, Stack } from "@mantine/core";
import cppFunction from "./code/cpp.txt?raw";
import asmFunction from "./code/asm.txt?raw";
import binaryFunction from "./code/binary.txt?raw";
import "./css/about.css";

export function About() {
  return (
    <Container id="main" size={"lg"}>
      <Stack>
        <div>
          <h1>The Wind Waker Decompilation Project</h1>
          <div>
            <p>
              An effort to reverse engineer the 2002 game "
              <Anchor
                href="https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker"
                target={"_blank"}
              >
                The Legend of Zelda: The Wind Waker
              </Anchor>
              " (often abbreviated as TWW). This project aims to decompile the
              game's original binary code back into its source code form.
            </p>
          </div>
        </div>
        <Stack>
          <Group grow>
            <div>
              <h2>1. Binary</h2>
              <CodeHighlight
                code={binaryFunction}
                language={"x86asm"}
                withCopyButton={false}
                style={{ maxHeight: "300px", overflow: "auto" }}
              />
            </div>
            <div>
              <h2>2. Assembly</h2>
              <CodeHighlight
                code={asmFunction}
                language={"x86asm"}
                withCopyButton={false}
                style={{ maxHeight: "300px", overflow: "auto" }}
              />
            </div>
          </Group>
          <div>
            <h2>3. C++ Source Code</h2>
            <CodeHighlight
              code={cppFunction}
              language={"cpp"}
              withCopyButton={false}
            />
          </div>
        </Stack>
      </Stack>
    </Container>
  );
}
