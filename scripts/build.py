from distutils.dir_util import copy_tree

print("Copying files")
copy_tree("../BestMap", "../")
print("Finished copying.")
