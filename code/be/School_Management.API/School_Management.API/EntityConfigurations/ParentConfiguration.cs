using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ParentConfiguration : IEntityTypeConfiguration<Parent>
    {
        public void Configure(EntityTypeBuilder<Parent> builder)
        {
            builder.HasIndex(x => x.UserId).IsUnique();
        }
    }
}
