import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add a StreamHandler to output logs to the console
console_handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

logger.info("hello world!!!!")
logger.info("this is the test for my first branch!")

print('a')