import hashlib
import sys

def main(args):
    _, len, data, *_ = args
    sha_signature = hashlib.sha256(data.encode()).hexdigest()
    len = int(len) 
    len = len if len < 64 or len > 1 else 64
    print(sha_signature[:len])

if __name__ == "__main__":
    main(sys.argv)