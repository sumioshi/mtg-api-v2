import os

def listar_estrutura(diretorio, nivel=0, ignorar=None):
    """
    Lista a estrutura de diretórios e arquivos de um projeto, ignorando itens irrelevantes.

    Args:
        diretorio (str): Caminho do diretório raiz do projeto.
        nivel (int): Nível de indentação (usado para recursão).
        ignorar (list): Lista de nomes de arquivos ou diretórios a serem ignorados.
    """
    if ignorar is None:
        ignorar = ["node_modules", ".git", "__pycache__", "dist", "build"]

    try:
        for item in os.listdir(diretorio):
            if item in ignorar:
                continue

            caminho_completo = os.path.join(diretorio, item)
            prefixo = " " * 4 * nivel + "|-- "

            if os.path.isdir(caminho_completo):
                print(f"{prefixo}{item}/")
                listar_estrutura(caminho_completo, nivel + 1, ignorar)  # Recursão para subdiretórios
            else:
                print(f"{prefixo}{item}")
    except PermissionError:
        print(f"{' ' * 4 * nivel}|-- [Permissão Negada]")

if __name__ == "__main__":
    # Caminho do repositório especificado
    caminho_repositorio = r"C:\ROQT\mtg-api-v2"  # Use r para strings brutas no Windows
    
    if os.path.exists(caminho_repositorio) and os.path.isdir(caminho_repositorio):
        print(f"Estrutura do projeto em '{caminho_repositorio}':\n")
        listar_estrutura(caminho_repositorio)
    else:
        print("O caminho especificado não é válido ou não é um diretório.")
