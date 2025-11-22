from cobra import io
import pickle

# Carregar modelo do JSON ou XML
model = io.read_sbml_model("Human-GEM.xml")

# Salvar como pickle
with open("Human-GEM.pkl", "wb") as f:
    pickle.dump(model, f)
