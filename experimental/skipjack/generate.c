/* Posted by @avhwl; see sources/algorithm.json. Only headers and main added. */
#include <stdio.h>
#include <stdlib.h>

int main(void) {
int F[256], k = 0;
for (int i = 0; i < 256; i++) F[i] = -1;
srand48(48571);
while (k < 256) {
    int v = 256 * drand48();
    if (F[v] < 0) F[v] = k++;
}
for (int i = 0; i < 256; i++)
    printf("%02x%c", F[i], i % 16 == 15 ? '\n' : ' ');
return 0;
}
