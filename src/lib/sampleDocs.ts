import { ConvertedDocument } from "../types/math";

export interface SampleDoc {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  equationsCount: number;
  dataUrl?: string; // Generated canvas image representation
  mockResult: ConvertedDocument;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: "calc_final",
    name: "Advanced Calculus & Analysis Exam",
    category: "University Calculus",
    difficulty: "Advanced",
    description: "Contains improper integrals, Taylor series expansion, differential equations, and multivariate extrema.",
    equationsCount: 7,
    mockResult: {
      title: "MAT 201: Advanced Calculus & Real Analysis - Final Examination",
      documentType: "exam",
      markdown: `# MAT 201: Advanced Calculus & Real Analysis - Final Examination\n\n**Instructions:** Answer all questions. Show complete working for full credit.\n\n### Problem 1: Gaussian & Improper Integrals\nEvaluate the Gaussian improper integral over the real line:\n$$\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}$$\nShow that for any parameter $\\alpha > 0$:\n$$\\int_{-\\infty}^{\\infty} e^{-\\alpha x^2} \\, dx = \\sqrt{\\frac{\\pi}{\\alpha}}$$\n\n### Problem 2: Taylor Series and Convergence\nFind the radius of convergence $R$ for the infinite power series expansion of:\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n (x - 2)^{2n}}{2^n \\cdot (2n)!}$$\nand compute the third-order derivative $f'''(2)$.\n\n### Problem 3: Second-Order Differential Equation\nFind the general solution to the damped harmonic oscillator equation:\n$$m \\frac{d^2 x}{dt^2} + \\gamma \\frac{dx}{dt} + k x = F_0 \\cos(\\omega t)$$\nwhere $m, \\gamma, k > 0$ and critical damping occurs when $\\gamma^2 = 4mk$.\n\n### Problem 4: Stokes' Theorem Application\nLet $\\mathbf{F}(x,y,z) = \\langle y^2, -z, x^2 \\rangle$. Verify Stokes' theorem:\n$$\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_{S} (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$$`,
      latex: `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{\\textbf{MAT 201: Advanced Calculus - Final Examination}}
\\author{Department of Mathematics}
\\date{Fall Semester}

\\begin{document}
\\maketitle

\\section*{Problem 1: Gaussian & Improper Integrals}
Evaluate the Gaussian improper integral over the real line:
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
\\]
Show that for any parameter $\\alpha > 0$:
\\[
\\int_{-\\infty}^{\\infty} e^{-\\alpha x^2} \\, dx = \\sqrt{\\frac{\\pi}{\\alpha}}
\\]

\\section*{Problem 2: Taylor Series and Convergence}
Find the radius of convergence $R$ for the series:
\\[
f(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n (x - 2)^{2n}}{2^n \\cdot (2n)!}
\\]

\\section*{Problem 3: Damped Harmonic Oscillator}
\\[
m \\frac{d^2 x}{dt^2} + \\gamma \\frac{dx}{dt} + k x = F_0 \\cos(\\omega t)
\\]

\\section*{Problem 4: Stokes' Theorem}
\\[
\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_{S} (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}
\\]

\\end{document}`,
      sections: [
        {
          type: "heading",
          content: "MAT 201: Advanced Calculus & Real Analysis - Final Examination",
          level: 1,
        },
        {
          type: "paragraph",
          content: "Instructions: Answer all questions. Show complete working for full credit.",
        },
        {
          type: "question",
          content: "Problem 1: Evaluate the Gaussian improper integral $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$ and compute $\\int_{-\\infty}^{\\infty} e^{-\\alpha x^2} dx = \\sqrt{\\frac{\\pi}{\\alpha}}$.",
        },
        {
          type: "equation_block",
          content: "\\int_{-\\infty}^{\\infty} e^{-\\alpha x^2} \\, dx = \\sqrt{\\frac{\\pi}{\\alpha}}",
        },
        {
          type: "question",
          content: "Problem 2: Find the radius of convergence $R$ for $f(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n (x - 2)^{2n}}{2^n \\cdot (2n)!}$ and evaluate $f'''(2)$.",
        },
        {
          type: "question",
          content: "Problem 3: Solve the second-order ordinary differential equation $m \\frac{d^2 x}{dt^2} + \\gamma \\frac{dx}{dt} + k x = F_0 \\cos(\\omega t)$.",
        },
        {
          type: "question",
          content: "Problem 4: Verify Stokes' Theorem $\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_{S} (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}$ for vector field $\\mathbf{F} = \\langle y^2, -z, x^2 \\rangle$.",
        },
      ],
      extractedEquations: [
        {
          id: "eq_1",
          latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}",
          isDisplay: true,
          description: "Gaussian improper integral",
        },
        {
          id: "eq_2",
          latex: "\\int_{-\\infty}^{\\infty} e^{-\\alpha x^2} \\, dx = \\sqrt{\\frac{\\pi}{\\alpha}}",
          isDisplay: true,
          description: "Parameterized Gaussian integral",
        },
        {
          id: "eq_3",
          latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{(-1)^n (x - 2)^{2n}}{2^n \\cdot (2n)!}",
          isDisplay: true,
          description: "Taylor power series expansion",
        },
        {
          id: "eq_4",
          latex: "m \\frac{d^2 x}{dt^2} + \\gamma \\frac{dx}{dt} + k x = F_0 \\cos(\\omega t)",
          isDisplay: true,
          description: "Damped harmonic oscillator equation",
        },
        {
          id: "eq_5",
          latex: "\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r} = \\iint_{S} (\\nabla \\times \\mathbf{F}) \\cdot d\\mathbf{S}",
          isDisplay: true,
          description: "Stokes' theorem in vector calculus",
        },
      ],
      stats: {
        equationCount: 5,
        questionCount: 4,
        confidenceScore: 99,
      },
    },
  },
  {
    id: "quantum_linear_algebra",
    name: "Linear Algebra & Quantum Mechanics",
    category: "Physics & Linear Algebra",
    difficulty: "Advanced",
    description: "Eigenvalues, Pauli matrices, unitary operators, and Schrödinger's equation.",
    equationsCount: 6,
    mockResult: {
      title: "PHYS 305: Quantum Mechanics & Hilbert Spaces",
      documentType: "homework",
      markdown: `# PHYS 305: Quantum Mechanics & Hilbert Spaces\n\n### Problem 1: Time-Dependent Schrödinger Equation\nThe fundamental state equation for a wave function $\\Psi(\\mathbf{r}, t)$ in potential $V(\\mathbf{r})$:\n$$i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\Psi(\\mathbf{r}, t)$$\n\n### Problem 2: Pauli Spin Matrices and Commutators\nGiven the Pauli matrices in the standard $\\sigma_z$ eigenbasis:\n$$\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad \\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$$\nVerify the angular momentum Lie algebra commutator:\n$$[\\sigma_a, \\sigma_b] = 2i \\sum_{c=1}^3 \\epsilon_{abc} \\sigma_c$$\n\n### Problem 3: Eigenvalue Problem\nSolve the characteristic polynomial $\\det(A - \\lambda I) = 0$ for Hermitian matrix $A$:\n$$A = \\begin{pmatrix} 3 & -1 & 0 \\\\ -1 & 4 & -1 \\\\ 0 & -1 & 3 \\end{pmatrix}$$`,
      latex: `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}
\\section*{Quantum Mechanics & Hilbert Spaces}
\\[
i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\Psi(\\mathbf{r}, t)
\\]
\\[
\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad \\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}
\\]
\\end{document}`,
      sections: [
        {
          type: "heading",
          content: "PHYS 305: Quantum Mechanics & Hilbert Spaces",
          level: 1,
        },
        {
          type: "question",
          content: "Problem 1: State and analyze the time-dependent Schrödinger equation $i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)$.",
        },
        {
          type: "equation_block",
          content: "i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\Psi(\\mathbf{r}, t)",
        },
        {
          type: "question",
          content: "Problem 2: Compute commutators $[\\sigma_x, \\sigma_y] = 2i\\sigma_z$ for Pauli spin matrices.",
        },
        {
          type: "equation_block",
          content: "\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad \\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}",
        },
      ],
      extractedEquations: [
        {
          id: "eq_1",
          latex: "i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\Psi(\\mathbf{r}, t)",
          isDisplay: true,
          description: "Time-dependent Schrödinger equation",
        },
        {
          id: "eq_2",
          latex: "\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad \\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad \\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}",
          isDisplay: true,
          description: "Pauli spin matrices",
        },
        {
          id: "eq_3",
          latex: "[\\sigma_a, \\sigma_b] = 2i \\sum_{c=1}^3 \\epsilon_{abc} \\sigma_c",
          isDisplay: true,
          description: "Lie algebra commutation relation",
        },
      ],
      stats: {
        equationCount: 3,
        questionCount: 3,
        confidenceScore: 98,
      },
    },
  },
  {
    id: "olympiad_math",
    name: "Mathematics Olympiad Contest",
    category: "Competition Math",
    difficulty: "Olympiad",
    description: "Cauchy-Schwarz inequality, polynomial roots, trigonometric identities, and integer equations.",
    equationsCount: 5,
    mockResult: {
      title: "National Mathematical Olympiad - Problem Set",
      documentType: "exam",
      markdown: `# National Mathematical Olympiad - Problem Set\n\n### Problem 1: Cauchy-Schwarz & AM-GM\nLet $a, b, c$ be positive real numbers such that $a + b + c = 3$. Prove that:\n$$\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}$$\n\n### Problem 2: Viète's Formulas & Roots\nLet $P(x) = x^3 - 7x^2 + 14x - 8$ with roots $r_1, r_2, r_3$. Evaluate:\n$$S = \\frac{1}{r_1^2} + \\frac{1}{r_2^2} + \\frac{1}{r_3^2}$$\nUsing Viète's identities:\n$$r_1 + r_2 + r_3 = 7, \\quad r_1 r_2 + r_2 r_3 + r_3 r_1 = 14, \\quad r_1 r_2 r_3 = 8$$\n\n### Problem 3: Trigonometric Product\nProve the classical identity for $n$ terms:\n$$\\prod_{k=1}^{n-1} \\sin\\left( \\frac{k\\pi}{n} \\right) = \\frac{n}{2^{n-1}}$$`,
      latex: `\\documentclass[12pt]{article}
\\usepackage{amsmath,amssymb}
\\begin{document}
\\title{National Mathematical Olympiad}
\\maketitle
\\section*{Problem 1}
Prove that for positive $a, b, c$ with $a+b+c=3$:
\\[
\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}
\\]
\\end{document}`,
      sections: [
        {
          type: "heading",
          content: "National Mathematical Olympiad - Problem Set",
          level: 1,
        },
        {
          type: "question",
          content: "Problem 1: Let $a, b, c > 0$ such that $a + b + c = 3$. Prove $\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}$.",
        },
        {
          type: "equation_block",
          content: "\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}",
        },
        {
          type: "question",
          content: "Problem 2: Compute $S = \\frac{1}{r_1^2} + \\frac{1}{r_2^2} + \\frac{1}{r_3^2}$ for polynomial $P(x) = x^3 - 7x^2 + 14x - 8$.",
        },
        {
          type: "question",
          content: "Problem 3: Prove $\\prod_{k=1}^{n-1} \\sin\\left( \\frac{k\\pi}{n} \\right) = \\frac{n}{2^{n-1}}$.",
        },
      ],
      extractedEquations: [
        {
          id: "eq_1",
          latex: "\\frac{a}{1 + b^2} + \\frac{b}{1 + c^2} + \\frac{c}{1 + a^2} \\ge \\frac{3}{2}",
          isDisplay: true,
          description: "Olympiad inequality",
        },
        {
          id: "eq_2",
          latex: "S = \\frac{1}{r_1^2} + \\frac{1}{r_2^2} + \\frac{1}{r_3^2} = \\frac{(r_1 r_2 + r_2 r_3 + r_3 r_1)^2 - 2 r_1 r_2 r_3 (r_1+r_2+r_3)}{(r_1 r_2 r_3)^2}",
          isDisplay: true,
          description: "Symmetric sums of polynomial roots",
        },
        {
          id: "eq_3",
          latex: "\\prod_{k=1}^{n-1} \\sin\\left( \\frac{k\\pi}{n} \\right) = \\frac{n}{2^{n-1}}",
          isDisplay: true,
          description: "Trigonometric finite product formula",
        },
      ],
      stats: {
        equationCount: 3,
        questionCount: 3,
        confidenceScore: 97,
      },
    },
  },
];

/**
 * Creates an authentic-looking canvas visual representation of a math paper
 */
export function generateSamplePaperCanvas(sample: SampleDoc): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1130; // ~A4 aspect ratio
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Paper background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid/ruled line texture
  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1;
  for (let y = 80; y < canvas.height - 40; y += 28) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(canvas.width - 60, y);
    ctx.stroke();
  }

  // Header border
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(55, 45, canvas.width - 110, 100);

  // Institution / Title text
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 20px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText(sample.mockResult.title.slice(0, 48), canvas.width / 2, 85);

  ctx.font = "italic 13px 'Times New Roman', serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("Course Assessment • Full Time Allowed: 120 Minutes • Scientific Formulations Included", canvas.width / 2, 115);

  ctx.textAlign = "left";
  let curY = 190;

  // Render question text & formulas on simulated printed page
  for (const [idx, eq] of sample.mockResult.extractedEquations.entries()) {
    if (curY > canvas.height - 120) break;

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 15px 'Times New Roman', serif";
    ctx.fillText(`Question ${idx + 1}: [6 Marks]`, 65, curY);
    curY += 26;

    ctx.fillStyle = "#334155";
    ctx.font = "14px 'Times New Roman', serif";
    ctx.fillText(`Derive or evaluate the mathematical expression for ${eq.description || "the given system"}:`, 65, curY);
    curY += 34;

    // Math formula box
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.fillRect(75, curY - 5, canvas.width - 150, 52);
    ctx.strokeRect(75, curY - 5, canvas.width - 150, 52);

    ctx.fillStyle = "#090d16";
    ctx.font = "italic 16px 'Cambria Math', 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.fillText(eq.latex.replace(/\\/g, " "), canvas.width / 2, curY + 28);
    ctx.textAlign = "left";

    curY += 75;
  }

  // Stamp / Watermark
  ctx.save();
  ctx.translate(canvas.width - 140, canvas.height - 80);
  ctx.rotate(-0.1);
  ctx.strokeStyle = "rgba(37, 99, 235, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-60, -20, 120, 40);
  ctx.fillStyle = "rgba(37, 99, 235, 0.5)";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL EXAM", 0, 4);
  ctx.restore();

  return canvas.toDataURL("image/png");
}
