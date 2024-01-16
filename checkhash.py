import hashlib
import sys

def hash_string(input_string):
    sha_signature = hashlib.sha256(input_string.encode()).hexdigest()
    print(sha_signature[:31])

if __name__ == "__main__":
    hash_string(sys.argv[1])