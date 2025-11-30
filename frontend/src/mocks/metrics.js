export default [
  {
    name: "CHA2DS2-VASc",
    reference: "Lip GYH et al., 2010, Europace",
    inputsDef: [
      { id: "age", label: "Idade", type: "number", default: 65 },
      {
        id: "sex",
        label: "Sexo",
        type: "select",
        options: [
          { value: "M", label: "Masculino" },
          { value: "F", label: "Feminino" },
        ],
      },
      {
        id: "hypertension",
        label: "Hipertensão",
        type: "checkbox",
        default: false,
      },
      {
        id: "stroke",
        label: "AVC/TIA prévio",
        type: "checkbox",
        default: false,
      },
    ],
    calculate: (inputs) => {
      let score = 0;
      if (inputs.age >= 75) score += 2;
      else if (inputs.age >= 65) score += 1;
      if (inputs.sex === "F") score += 1;
      if (inputs.hypertension) score += 1;
      if (inputs.stroke) score += 2;
      return {
        score,
        interpretation: score >= 2 ? "Alto risco" : "Baixo risco",
      };
    },
  },
  {
    name: "BMI",
    reference: "WHO, 2020",
    inputsDef: [
      { id: "weight", label: "Peso (kg)", type: "number" },
      { id: "height", label: "Altura (m)", type: "number" },
    ],
    calculate: (inputs) => {
      const h = parseFloat(inputs.height);
      const w = parseFloat(inputs.weight);
      const bmi = w && h ? (w / (h * h)).toFixed(1) : "-";
      let interpretation = "-";
      if (bmi !== "-") {
        if (bmi < 18.5) interpretation = "Abaixo do peso";
        else if (bmi < 25) interpretation = "Peso normal";
        else if (bmi < 30) interpretation = "Sobrepeso";
        else interpretation = "Obesidade";
      }
      return { score: bmi, interpretation };
    },
  },
  // Você pode adicionar Apgar, CURB65, etc.
];
