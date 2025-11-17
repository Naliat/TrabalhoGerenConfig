import logging

def setup_logger():
    logging.basicConfig(
        level=logging.DEBUG,
        format="\n\033[94m[LOG] %(asctime)s - %(levelname)s - %(message)s\033[0m",
        datefmt='%H:%M:%S'
    )
