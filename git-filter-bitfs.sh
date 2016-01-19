git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch BitFS/filesystem.zip' \
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch BitFS/bitos.elf' \
--prune-empty --tag-name-filter cat -- --all