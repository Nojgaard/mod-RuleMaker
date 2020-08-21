SHELL=/bin/bash
summary/all.tex: gen
summary.pdf: summary/all.tex
	/home/nikolai/miniconda3/envs/modviz/bin/../bin/mod_post --mode compileSummary
include summary/MakefileImpl
include summary/MakefileDep
include summary/MakefileAllTarget
include summary/MakefileClean
