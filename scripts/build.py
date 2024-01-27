from distutils.dir_util import copy_tree

print("Cleaning files...")
import clean
print("Copying files")
copy_tree("../BestMap", "../")
print("Build finished.")
